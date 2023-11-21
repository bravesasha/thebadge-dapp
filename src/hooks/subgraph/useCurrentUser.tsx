import useSWR from 'swr'

import useSubgraph from '@/src/hooks/subgraph/useSubgraph'
import useChainId from '@/src/hooks/theBadge/useChainId'
const { useWeb3Connection } = await import('@/src/providers/web3ConnectionProvider')
import { User } from '@/types/generated/subgraph'

export const useCurrentUser = () => {
  const { address } = useWeb3Connection()
  const gql = useSubgraph()
  const chainId = useChainId()

  return useSWR(address ? [`user:${address}`, address, chainId] : null, async () => {
    const userById = await gql.userById({ id: address || '' })
    // We need to return an empty object as an User, if not the result from the subgraph is null and SWR will
    // keep the suspense no matter what, bc its thinks that the promise is not resolved yet
    return userById.user || ({} as User)
  })
}
