-- Forge initial schema: profiles, organizations, projects, interviews,
-- blueprints, generation jobs, and AI usage tracking — all protected by
-- row-level security so users can only reach data in their organizations.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create a profile automatically when a user registers.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create policy "Users can view their own profile"
  on public.profiles for select
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using ((select auth.uid()) = id);

-- ---------------------------------------------------------------------------
-- organizations and membership
-- ---------------------------------------------------------------------------

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  industry text,
  team_size text,
  location text,
  main_customer_type text,
  current_tools text,
  biggest_problem text,
  desired_outcome text,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member', 'viewer')),
  joined_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

create trigger organizations_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

-- security definer avoids infinite recursion between the membership policies.
create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = org_id
      and m.user_id = (select auth.uid())
  );
$$;

create or replace function public.has_org_role(org_id uuid, roles text[])
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = org_id
      and m.user_id = (select auth.uid())
      and m.role = any (roles)
  );
$$;

create policy "Members can view their organizations"
  on public.organizations for select
  using (public.is_org_member(id));

create policy "Users can create organizations"
  on public.organizations for insert
  with check ((select auth.uid()) = created_by);

create policy "Owners and admins can update organizations"
  on public.organizations for update
  using (public.has_org_role(id, array['owner', 'admin']));

create policy "Members can view memberships in their organizations"
  on public.organization_members for select
  using (public.is_org_member(organization_id));

create policy "Organization creators can add themselves as owner"
  on public.organization_members for insert
  with check (
    user_id = (select auth.uid())
    and role = 'owner'
    and exists (
      select 1 from public.organizations o
      where o.id = organization_id
        and o.created_by = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  status text not null default 'discovery'
    check (status in ('discovery', 'blueprint', 'approved', 'generating', 'ready', 'deployed', 'archived')),
  industry text,
  original_prompt text not null,
  active_blueprint_version_id uuid,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

alter table public.projects enable row level security;

create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create index projects_organization_id_idx on public.projects (organization_id);

create or replace function public.is_project_member(p_project_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.projects p
    join public.organization_members m on m.organization_id = p.organization_id
    where p.id = p_project_id
      and m.user_id = (select auth.uid())
  );
$$;

create or replace function public.can_edit_project(p_project_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.projects p
    join public.organization_members m on m.organization_id = p.organization_id
    where p.id = p_project_id
      and m.user_id = (select auth.uid())
      and m.role in ('owner', 'admin', 'member')
  );
$$;

create policy "Members can view projects"
  on public.projects for select
  using (public.is_org_member(organization_id));

create policy "Non-viewer members can create projects"
  on public.projects for insert
  with check (
    public.has_org_role(organization_id, array['owner', 'admin', 'member'])
    and created_by = (select auth.uid())
  );

create policy "Non-viewer members can update projects"
  on public.projects for update
  using (public.has_org_role(organization_id, array['owner', 'admin', 'member']));

create policy "Owners and admins can delete projects"
  on public.projects for delete
  using (public.has_org_role(organization_id, array['owner', 'admin']));

-- ---------------------------------------------------------------------------
-- discovery interviews
-- ---------------------------------------------------------------------------

create table public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  status text not null default 'active'
    check (status in ('active', 'completed', 'abandoned')),
  current_stage text,
  summary jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.interview_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  structured_data jsonb,
  created_at timestamptz not null default now()
);

alter table public.interview_sessions enable row level security;
alter table public.interview_messages enable row level security;

create trigger interview_sessions_updated_at
  before update on public.interview_sessions
  for each row execute function public.set_updated_at();

create index interview_sessions_project_id_idx on public.interview_sessions (project_id);
create index interview_messages_session_id_idx on public.interview_messages (session_id);

create policy "Project members can view interview sessions"
  on public.interview_sessions for select
  using (public.is_project_member(project_id));

create policy "Project editors can create interview sessions"
  on public.interview_sessions for insert
  with check (public.can_edit_project(project_id));

create policy "Project editors can update interview sessions"
  on public.interview_sessions for update
  using (public.can_edit_project(project_id));

create policy "Project members can view interview messages"
  on public.interview_messages for select
  using (
    exists (
      select 1 from public.interview_sessions s
      where s.id = session_id
        and public.is_project_member(s.project_id)
    )
  );

create policy "Project editors can create interview messages"
  on public.interview_messages for insert
  with check (
    exists (
      select 1 from public.interview_sessions s
      where s.id = session_id
        and public.can_edit_project(s.project_id)
    )
  );

-- ---------------------------------------------------------------------------
-- blueprints
-- ---------------------------------------------------------------------------

create table public.blueprints (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  version_number integer not null,
  title text not null,
  summary text,
  content jsonb not null,
  status text not null default 'draft'
    check (status in ('draft', 'approved', 'superseded')),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  unique (project_id, version_number)
);

alter table public.blueprints enable row level security;

create index blueprints_project_id_idx on public.blueprints (project_id);

create policy "Project members can view blueprints"
  on public.blueprints for select
  using (public.is_project_member(project_id));

create policy "Project editors can create blueprints"
  on public.blueprints for insert
  with check (
    public.can_edit_project(project_id)
    and created_by = (select auth.uid())
  );

create policy "Project editors can update blueprints"
  on public.blueprints for update
  using (public.can_edit_project(project_id));

-- ---------------------------------------------------------------------------
-- generated files and versions (used from the generation phase onward)
-- ---------------------------------------------------------------------------

create table public.project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  path text not null,
  content text not null,
  language text,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, path)
);

create table public.project_versions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  version_number integer not null,
  description text,
  snapshot jsonb,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  unique (project_id, version_number)
);

create table public.generation_jobs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  job_type text not null,
  status text not null default 'queued'
    check (status in ('queued', 'running', 'completed', 'failed')),
  progress_stage text,
  error_message text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

alter table public.project_files enable row level security;
alter table public.project_versions enable row level security;
alter table public.generation_jobs enable row level security;

create trigger project_files_updated_at
  before update on public.project_files
  for each row execute function public.set_updated_at();

create policy "Project members can view files"
  on public.project_files for select
  using (public.is_project_member(project_id));

create policy "Project members can view versions"
  on public.project_versions for select
  using (public.is_project_member(project_id));

create policy "Project members can view generation jobs"
  on public.generation_jobs for select
  using (public.is_project_member(project_id));

-- ---------------------------------------------------------------------------
-- AI usage tracking
-- ---------------------------------------------------------------------------

create table public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete set null,
  project_id uuid references public.projects (id) on delete set null,
  user_id uuid references auth.users (id) on delete set null,
  operation text not null,
  provider text not null,
  model text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  estimated_cost numeric(10, 6),
  created_at timestamptz not null default now()
);

alter table public.ai_usage enable row level security;

create index ai_usage_organization_id_idx on public.ai_usage (organization_id);

create policy "Members can view their organization's AI usage"
  on public.ai_usage for select
  using (organization_id is not null and public.is_org_member(organization_id));

create policy "Users can record their own AI usage"
  on public.ai_usage for insert
  with check (user_id = (select auth.uid()));
