'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    onUploading?: (uploading: boolean) => void;
}

export default function ImageUpload({ value, onChange, onUploading }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(value);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            onUploading?.(true);

            if (!event.target.files || event.target.files.length === 0) {
                return;
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('products')
                .getPublicUrl(filePath);

            onChange(data.publicUrl);
            setPreview(data.publicUrl);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image');
        } finally {
            setUploading(false);
            onUploading?.(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                border: '1px solid #e5e7eb',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                background: '#f9fafb'
            }}>
                {preview ? (
                    <img
                        src={preview}
                        alt="Preview"
                        style={{
                            width: '3rem',
                            height: '3rem',
                            objectFit: 'cover',
                            borderRadius: '0.25rem',
                            background: '#eee'
                        }}
                    />
                ) : (
                    <div style={{
                        width: '3rem',
                        height: '3rem',
                        borderRadius: '0.25rem',
                        background: '#e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        color: '#9ca3af'
                    }}>
                        🖼️
                    </div>
                )}

                <div style={{ flex: 1 }}>
                    <label style={{
                        display: 'inline-block',
                        padding: '0.5rem 1rem',
                        backgroundColor: uploading ? '#9ca3af' : '#7c3aed',
                        color: 'white',
                        borderRadius: '0.375rem',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        transition: 'background 0.2s'
                    }}>
                        {uploading ? 'Uploading...' : 'Choose Image'}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleUpload}
                            disabled={uploading}
                            style={{ display: 'none' }}
                        />
                    </label>
                    {value && !uploading && (
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem', wordBreak: 'break-all' }}>
                            {value.split('/').pop()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
