-- Write policies for the generation phase: project editors can create and
-- update generated files, version snapshots, and generation jobs.

create policy "Project editors can create files"
  on public.project_files for insert
  with check (public.can_edit_project(project_id));

create policy "Project editors can update files"
  on public.project_files for update
  using (public.can_edit_project(project_id));

create policy "Project editors can delete files"
  on public.project_files for delete
  using (public.can_edit_project(project_id));

create policy "Project editors can create versions"
  on public.project_versions for insert
  with check (public.can_edit_project(project_id));

create policy "Project editors can create generation jobs"
  on public.generation_jobs for insert
  with check (public.can_edit_project(project_id));

create policy "Project editors can update generation jobs"
  on public.generation_jobs for update
  using (public.can_edit_project(project_id));
