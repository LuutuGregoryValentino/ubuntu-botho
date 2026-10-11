import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { getAdminSupabase } from '@/lib/supabase';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT_URL!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const { folderUrl, albumTitle, albumDescription } = await request.json();

    const folderIdMatch = folderUrl.match(/folders\/([a-zA-Z0-9_-]+)/);
    const folderId = folderIdMatch ? folderIdMatch[1] : folderUrl;

    if (!folderId) {
      return NextResponse.json({ error: 'Invalid Google Drive Folder URL' }, { status: 400 });
    }

    const base64Creds = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
    if (!base64Creds) {
      return NextResponse.json({ error: 'Missing GOOGLE_SERVICE_ACCOUNT_BASE64 in environment variables' }, { status: 500 });
    }

    const decodedJsonString = Buffer.from(base64Creds, 'base64').toString('utf8');
    const credentials = JSON.parse(decodedJsonString);

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key,
      },
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Fetch supported web image formats from Drive Folder
    const driveRes = await drive.files.list({
      q: `'${folderId}' in parents and (mimeType = 'image/jpeg' or mimeType = 'image/png' or mimeType = 'image/webp' or mimeType = 'image/jpg') and trashed = false`,
      fields: 'files(id, name, mimeType)',
    });

    const files = driveRes.data.files || [];
    if (files.length === 0) {
      return NextResponse.json({ message: 'No compatible web images (JPEG, PNG, WebP) found in the specified folder.' }, { status: 404 });
    }

    const supabaseAdmin = getAdminSupabase();

    const { data: album, error: albumError } = await supabaseAdmin
      .from('albums')
      .insert({
        title: albumTitle || 'New Event Album',
        description: albumDescription || '',
      })
      .select()
      .single();

    if (albumError) throw albumError;

    let processedCount = 0;
    let firstImageR2Url = '';

    for (const [index, file] of files.entries()) {
      try {
        const imgStream = await drive.files.get(
          { fileId: file.id!, alt: 'media' },
          { responseType: 'arraybuffer' }
        );

        const buffer = Buffer.from(imgStream.data as ArrayBuffer);

        const webpBuffer = await sharp(buffer)
          .resize({ width: 1920, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();

        const filename = `albums/${album.id}/${file.id}.webp`;

        await r2Client.send(
          new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: filename,
            Body: webpBuffer,
            ContentType: 'image/webp',
          })
        );

        const publicR2Url = `${process.env.R2_PUBLIC_PUBLIC_URL}/${filename}`;

        if (!firstImageR2Url) {
          firstImageR2Url = publicR2Url;
        }

        await supabaseAdmin.from('images').insert({
          album_id: album.id,
          r2_url: publicR2Url,
          original_drive_id: file.id,
          display_order: processedCount,
          is_pinned: false,
        });

        processedCount++;
      } catch (fileError: any) {
        console.error(`Skipping file ${file.name} (${file.id}) due to processing error:`, fileError.message);
      }
    }

    if (processedCount === 0) {
      return NextResponse.json({ error: 'All files failed image processing.' }, { status: 500 });
    }

    if (firstImageR2Url) {
      await supabaseAdmin
        .from('albums')
        .update({ cover_r2_url: firstImageR2Url })
        .eq('id', album.id);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${processedCount} images into Cloudflare R2 and Supabase.`,
      albumId: album.id,
    });
  } catch (error: any) {
    console.error('Sync Error:', error);
    return NextResponse.json({ error: error.message || 'Server processing error' }, { status: 500 });
  }
}