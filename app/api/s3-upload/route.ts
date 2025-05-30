// app/api/s3-upload/route.ts
import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const { fileName, fileType } = await request.json();

    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'File name and type are required' }, { status: 400 });
    }

    // --- CORRECTED s3Key construction ---
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_'); // Sanitize more aggressively
    const uniqueFileName = `${uuidv4()}-${sanitizedFileName}`;
    const s3Key = `resumes/${uniqueFileName}`;
    // --- END CORRECTION ---

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: s3Key,
      ContentType: fileType,
    });

    const expiresIn = 300; // 5 minutes
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });

    // --- CORRECTED finalFileUrl construction ---
    const finalFileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3Key}`;
    // --- END CORRECTION ---

    return NextResponse.json({
      uploadUrl: signedUrl,
      key: s3Key,
      finalUrl: finalFileUrl
    });

  } catch (error) {
    console.error('Error generating signed URL:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to generate signed URL', details: errorMessage }, { status: 500 });
  }
}