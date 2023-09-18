import { useRouter } from 'next/router'
import * as React from 'react'
import { useEffect } from 'react'

import { withPageGenericSuspense } from '@/src/components/helpers/SafeSuspense'
import { ZERO_ADDRESS } from '@/src/constants/bigNumber'
import useModelIdParam from '@/src/hooks/nextjs/useModelIdParam'
import useBadgeModel from '@/src/hooks/subgraph/useBadgeModel'
import useMintValue from '@/src/hooks/theBadge/useMintValue'
import { useContractInstance } from '@/src/hooks/useContractInstance'
import useTransaction, { TransactionStates } from '@/src/hooks/useTransaction'
import MintThirdPartyWithSteps from '@/src/pagePartials/badge/mint/MintThirdPartyWithSteps'
import { MintThirdPartySchemaType } from '@/src/pagePartials/badge/mint/schema/MintThirdPartySchema'
import { cleanMintFormValues } from '@/src/pagePartials/badge/mint/utils'
import { PreventActionIfBadgeTypePaused } from '@/src/pagePartials/errors/preventActionIfPaused'
import { RequiredNotHaveBadge } from '@/src/pagePartials/errors/requiredNotHaveBadge'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { encodeIpfsBadgeMetadata } from '@/src/utils/badges/createBadgeModelHelpers'
import { BadgeModelMetadata } from '@/types/badges/BadgeMetadata'
import { TheBadge__factory } from '@/types/generated/typechain'
import { NextPageWithLayout } from '@/types/next'

const MintThirdPartyBadgeModel: NextPageWithLayout = () => {
  const { appPubKey, isSocialWallet, userSocialInfo } = useWeb3Connection()
  const theBadge = useContractInstance(TheBadge__factory, 'TheBadge')
  const { resetTxState, sendTx, state } = useTransaction()
  const router = useRouter()
  const badgeModelId = useModelIdParam()

  if (!badgeModelId) {
    throw `No modelId provided us URL query param`
  }

  useEffect(() => {
    // Redirect to the profile
    if (state === TransactionStates.success) {
      router.push(`/profile`)
    }
  }, [router, state])

  const badgeModel = useBadgeModel(badgeModelId)

  if (badgeModel.error || !badgeModel.data) {
    throw `There was an error trying to fetch the metadata for the badge model`
  }

  const { data: mintValue } = useMintValue(badgeModelId)
  if (!mintValue) {
    throw `There was not possible to get the value to mint a badge for the badge model: ${badgeModelId}`
  }

  async function onSubmit(data: MintThirdPartySchemaType) {
    try {
      // Start transaction to show the loading state when we create the files
      // and configs
      const transaction = await sendTx(async () => {
        const { address, preferMintMethod, previewImage } = data
        // Use NextJs dynamic import to reduce the bundle size
        const { createAndUploadThirdPartyBadgeMetadata } = await import(
          '@/src/utils/badges/mintHelpers'
        )

        const badgeMetadataIPFSHash = await createAndUploadThirdPartyBadgeMetadata(
          badgeModel.data?.badgeModelMetadata as BadgeModelMetadata,
          badgeModelId,
          { imageBase64File: previewImage },
        )

        // If social login relay tx
        if (isSocialWallet && address && userSocialInfo && appPubKey) {
          // TODO Implement social login (or maybe create a hook that encapsulates this logic)
        }

        // If user is not social logged, just send the tx
        return theBadge.mint(
          badgeModelId,
          preferMintMethod === 'email' ? ZERO_ADDRESS : address,
          badgeMetadataIPFSHash,
          // TODO Check if this makes sense or not
          encodeIpfsBadgeMetadata(badgeMetadataIPFSHash),
          {
            value: mintValue,
          },
        )
      })
      if (transaction) {
        await transaction.wait()
      }
      cleanMintFormValues(badgeModelId)
    } catch (e) {
      console.error(e)
      // Do nothing
    }
  }

  return (
    <PreventActionIfBadgeTypePaused>
      <RequiredNotHaveBadge>
        <MintThirdPartyWithSteps onSubmit={onSubmit} resetTxState={resetTxState} txState={state} />
      </RequiredNotHaveBadge>
    </PreventActionIfBadgeTypePaused>
  )
}

export default withPageGenericSuspense(MintThirdPartyBadgeModel)
