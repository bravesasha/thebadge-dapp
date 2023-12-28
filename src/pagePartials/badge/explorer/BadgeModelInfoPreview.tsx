import { useRouter } from 'next/navigation'
import React from 'react'

import { Box, Divider, Skeleton, Stack, Typography } from '@mui/material'
import { ButtonV2, colors } from '@thebadge/ui-library'
import { useTranslation } from 'next-export-i18n'

import SafeSuspense from '@/src/components/helpers/SafeSuspense'
import useIsBadgeOwner from '@/src/hooks/subgraph/useIsBadgeOwner'
import useS3Metadata from '@/src/hooks/useS3Metadata'
import { useSizeSM } from '@/src/hooks/useSize'
import BadgeMintCost from '@/src/pagePartials/badge/explorer/addons/BadgeMintCost'
import CreatorInfoSmallPreview from '@/src/pagePartials/badge/explorer/addons/CreatorInfoSmallPreview'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { generateMintUrl, generateModelExplorerUrl } from '@/src/utils/navigation/generateUrl'
import { BadgeModelMetadata } from '@/types/badges/BadgeMetadata'
import { BadgeModel } from '@/types/generated/subgraph'

export default function BadgeModelInfoPreview({ badgeModel }: { badgeModel: BadgeModel }) {
  const { t } = useTranslation()
  const router = useRouter()
  const isMobile = useSizeSM()
  const { address } = useWeb3Connection()
  const resBadgeModelMetadata = useS3Metadata<{ content: BadgeModelMetadata }>(badgeModel.uri || '')
  const badgeMetadata = resBadgeModelMetadata.data?.content
  const isBadgeOwner = useIsBadgeOwner(badgeModel.id, address)

  const renderManagementOptions = () => {
    if (!isBadgeOwner) {
      return null
    }
    const onPauseBadgeModel = () => {
      console.log('pause badge model')
    }

    const onUnpauseBadgeModel = () => {
      console.log('unpause badge model')
    }

    const onEditBadgeModel = () => {
      console.log('Edit badge model')
    }

    return (
      <Stack gap={2}>
        <Divider color={colors.white} />
        <Box display="flex" flex="1" justifyContent="space-evenly" mt={2}>
          {badgeModel.paused ? (
            <ButtonV2
              backgroundColor={colors.greenLogo}
              onClick={() => onUnpauseBadgeModel()}
              variant="contained"
            >
              {t('explorer.preview.badge.unpause')}
            </ButtonV2>
          ) : (
            <ButtonV2
              backgroundColor={colors.redError}
              onClick={() => onPauseBadgeModel()}
              variant="contained"
            >
              {t('explorer.preview.badge.pause')}
            </ButtonV2>
          )}
          <ButtonV2
            backgroundColor={colors.blue}
            onClick={() => onEditBadgeModel()}
            variant="contained"
          >
            {t('explorer.preview.badge.edit')}
          </ButtonV2>
        </Box>
      </Stack>
    )
  }

  return (
    <Stack gap={4} mt={4}>
      {/* Badge Model info */}
      <Stack gap={2}>
        <Typography variant="titleLarge">{badgeMetadata?.name}</Typography>

        <Typography variant="bodyMedium">{badgeMetadata?.description}</Typography>
      </Stack>

      <Divider color={colors.white} />

      {/* Mint info */}
      <Stack gap={1}>
        <SafeSuspense fallback={<Skeleton variant="text" width={100} />}>
          <BadgeMintCost modelId={badgeModel.id} />
        </SafeSuspense>

        {isMobile && <Divider color={colors.white} sx={{ my: 2 }} />}

        <Typography fontWeight="bold" variant="titleMedium">
          {t('explorer.preview.badge.totalMinted')}
          <Typography component="span" sx={{ ml: 1 }} variant="dAppTitle2">
            {badgeModel.badgesMintedAmount}
          </Typography>
        </Typography>
      </Stack>

      <Box display="flex" flex="1" justifyContent="space-between">
        <ButtonV2
          backgroundColor={colors.transparent}
          onClick={() =>
            router.push(generateModelExplorerUrl(badgeModel.id, badgeModel.controllerType))
          }
          variant="outlined"
        >
          {t('explorer.preview.badge.showOthers')}
        </ButtonV2>

        <ButtonV2
          backgroundColor={colors.blue}
          onClick={() => router.push(generateMintUrl(badgeModel.controllerType, badgeModel.id))}
          sx={{ ml: 'auto' }}
          variant="contained"
        >
          {t('explorer.preview.badge.mint')}
        </ButtonV2>
      </Box>

      {renderManagementOptions()}

      {/* Creator info */}
      <SafeSuspense>
        <CreatorInfoSmallPreview creator={badgeModel.creator} />
      </SafeSuspense>
    </Stack>
  )
}
