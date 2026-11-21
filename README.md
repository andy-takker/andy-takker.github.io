# andy-takker.github.io

Personal site of Sergey Natalenko: resume, projects, writing and services.
GitHub Pages builds it with Jekyll on every push to `main`; there is nothing to install.

## Updating content

Edit the YAML files in `_data/` (works fine in the GitHub web editor):

| What | File | Add |
|------|------|-----|
| Article | `_data/articles.yml` | `title`, `url`, `date` at the top |
| Job | `_data/jobs.yml` | copy a block to the top: `dates`, `role`, `company`, optional `summary`, `bullets`, `stack` |
| Project or experiment | `_data/projects.yml` | `name`, `url`, `group` (`projects` or `experiments`), `lang`, `desc`, `tech` (3–5 items) |

Quote a value in `"..."` if it contains a colon. Everything else (about, services, stack,
education, contact) is plain HTML in `index.html`. `resume.pdf` is the LinkedIn profile export.

## Local preview

```sh
docker run --rm -p 4000:4000 -v "$PWD":/srv/jekyll jekyll/jekyll:3.8 jekyll serve
```

Then open http://localhost:4000. Press `` ` `` on the page for a small shell.
