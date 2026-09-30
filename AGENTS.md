<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules

- Admin access is email-only and checked server-side against the `admin_emails` table via a service-role server function — never trust a client-side admin flag, so a guessed email alone cannot read submissions.
- Receipts live in the private `receipts` storage bucket under `<user_id>/`; admins view them through short-lived signed URLs generated server-side.
- Users can insert and read only their own submissions; status changes to `approved` happen exclusively in `src/lib/admin.functions.ts`.
