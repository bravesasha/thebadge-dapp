import React from 'react'

import { Box, Stack, Typography } from '@mui/material'
import { useTranslation } from 'next-export-i18n'
import { Control, Controller } from 'react-hook-form'
import { ImageType } from 'react-images-uploading'

import { AvatarInput } from '@/src/components/form/formFields/AvatarInput'
import { TextArea } from '@/src/components/form/formFields/TextArea'
import { TextField } from '@/src/components/form/formFields/TextField'

type Props = {
  formControl: Control<any>
}

export default function AccountDetails({ formControl }: Props) {
  const { t } = useTranslation()
  return (
    <Stack gap={2}>
      <Typography variant="dAppTitle1">
        {t('creator.register.form.accountDetails.title')}
      </Typography>
      <Box display="flex" flexDirection="row" gap={5} justifyContent="space-between">
        <Stack flex="2" gap={2} justifyContent="space-between">
          <Controller
            control={formControl}
            name={'register.name'}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <TextField
                error={error}
                label={t('creator.register.form.accountDetails.displayName')}
                onChange={onChange}
                value={value}
              />
            )}
          />
          <Controller
            control={formControl}
            name={'register.description'}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <TextArea
                error={error}
                label={t('creator.register.form.accountDetails.description')}
                onChange={onChange}
                value={value}
              />
            )}
          />
        </Stack>
        <Stack flex="1" gap={2}>
          <Controller
            control={formControl}
            name={'register.logo'}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <AvatarInput
                error={error}
                label={t('creator.register.form.accountDetails.logo')}
                onChange={(value: ImageType | null) => {
                  if (value) {
                    // We change the structure a little bit to have it ready to push to the backend
                    onChange({
                      mimeType: value.file?.type,
                      base64File: value.base64File,
                    })
                  } else onChange(null)
                }}
                value={value}
              />
            )}
          />
        </Stack>
      </Box>
    </Stack>
  )
}
