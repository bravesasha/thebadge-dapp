import { z } from 'zod'

import {
  ChallengePeriodTypeSchema,
  DeltaPDFSchema,
  ExpirationTypeSchema,
  FileSchema,
  ImageSchema,
  KlerosDynamicFields,
  LongTextSchema,
  SeverityTypeSchema,
  TokenInputSchema,
} from '@/src/components/form/helpers/customSchemas'
import { ModelsBackgroundsNames } from '@/src/constants/backgrounds'
import { CreatorRegisterSchema } from '@/src/pagePartials/creator/register/schema/CreatorRegisterSchema'

/**
 * Auxiliary schema to support the PDF upload or the PDF creation on the same form
 */
const CommunityBadgeModelCriteriaSchema = z
  .object({
    criteriaFileUri: FileSchema,
    criteriaDeltaText: DeltaPDFSchema,
  })
  .partial()
  .superRefine((data, ctx) => {
    if (!data.criteriaFileUri && !data.criteriaDeltaText) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['criteriaFileUri'],
        message: 'You must add a criteria, upload a PDF or write it down on the editor',
      })
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['criteriaDeltaText'],
        message: 'You must add a criteria, upload a PDF or write it down on the editor',
      })
    }
  })

const MiniLogoCustomFieldsConfigurationSchema = z
  .object({
    miniLogoTitle: z.string().max(4).optional(),
    miniLogoSubTitle: z.string().max(10).optional(),
    miniLogoUrl: z.string().optional(),
  })
  .optional()

export const CustomFieldsConfigurationSchema = z.object({
  // ------ BADGE BASICS FIELD ------
  customFieldsEnabled: z.boolean().optional(),
  miniLogo: MiniLogoCustomFieldsConfigurationSchema,
})
export type CustomFieldsConfigurationSchemaType = z.infer<typeof CustomFieldsConfigurationSchema>

export const CreateCommunityModelSchema = z
  .object({
    // ------ UI BASICS FIELD ------
    name: z.string().max(28),
    description: LongTextSchema,
    badgeModelLogoUri: ImageSchema,
    textContrast: z.string(),
    backgroundImage: z.custom<ModelsBackgroundsNames>(),
    template: z.string(),
    // ------ STRATEGY FIELD ------
    criteria: CommunityBadgeModelCriteriaSchema,
    challengePeriodDuration: ChallengePeriodTypeSchema,
    rigorousness: SeverityTypeSchema,
    mintFee: TokenInputSchema,
    validFor: ExpirationTypeSchema,
    // ------ EVIDENCE FORM FIELD ------
    badgeMetadataColumns: KlerosDynamicFields,
  })
  .merge(CustomFieldsConfigurationSchema)
  // ------ User register ------
  .merge(CreatorRegisterSchema)

export type BadgeModelCommunityCriteriaType = z.infer<typeof CommunityBadgeModelCriteriaSchema>
export type CreateCommunityModelSchemaType = z.infer<typeof CreateCommunityModelSchema>
