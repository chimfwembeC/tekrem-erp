import PagePreview from '@/Components/CMS/PagePreview';
import AppLayout from '@/Layouts/AppLayout'
import React, { useState } from 'react'

export default function Preview({page}) {
    const [showPreview, setShowPreview] = useState(true);
    const meta = page.meta_title || page.title;
  return (
    <AppLayout title={``}>
         {showPreview && (
        <PagePreview
          page={page}
          onClose={() => setShowPreview(false)}
        />
      )}
    </AppLayout>
  )
}
