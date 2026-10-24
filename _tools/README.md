# Site tools

Not published: GitHub Pages skips folders that start with `_`.

## Keeping ratings current

1. Edit the numbers in `ratings.json`, and set `checked` to today's date.
2. From the `site` folder, run `python _tools/update_ratings.py`.

The script updates every number on every page (they're wrapped in `<span data-r="...">`), plus the homepage meta description, and rebuilds `llms.txt` from `llms.template.txt`.

To change the text of `llms.txt`, edit `llms.template.txt` and run the script. Don't edit `llms.txt` directly, or your change will be overwritten.
