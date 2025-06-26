import AppLayout from '@/Layouts/AppLayout'
import React from 'react'
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

export default function Index() {
     const { t } = useTranslate();
      const route = useRoute();
  return (
     <AppLayout
          title={t('administration', 'Permissions')}
          renderHeader={() => (
            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
              {t('hr.training_programs', 'Permissions')}
            </h2>
          )}
        >

        </AppLayout>
  )
}
