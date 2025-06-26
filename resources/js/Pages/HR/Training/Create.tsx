import AppLayout from '@/Layouts/AppLayout'
import React from 'react'
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

export default function Create() {
     const { t } = useTranslate();
      const route = useRoute();
  return (
     <AppLayout
          title={t('hr.training_programs', 'Training Programs')}
          renderHeader={() => (
            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
              {t('hr.training_programs', 'Training Programs')}
            </h2>
          )}
        >

        </AppLayout>
  )
}
