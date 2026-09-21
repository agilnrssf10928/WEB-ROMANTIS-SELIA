# Selia Photo Letter

Static Vercel site with a photo gallery and an unprotected `/settings.html` editor.

## Deploy

1. Import this folder into Vercel.
2. Create a Vercel Blob store from the project Storage tab.
3. Connect the store to the project and make sure `BLOB_READ_WRITE_TOKEN` is available under Project Settings > Environment Variables.
4. Deploy. The editor is available at `/settings`.

Without Blob configured, the site still renders the default photos but changes cannot persist.

The settings page intentionally has no login, as requested. It is not linked from the public gallery; open `/settings` directly. Keep that URL private because anyone who knows it can update the gallery.
