import {
  type TriggerEventType,
  triggerEventTypes,
} from "@chatbotx.io/database/partials"
import { InputField } from "@chatbotx.io/ui/components/form/input-field"
import {
  SelectField,
  type SelectOption,
} from "@chatbotx.io/ui/components/form/select-field"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTagSelectOptions } from "@/features/tags/provider/tag-hook"
import { client } from "@/lib/orpc/orpc"
import { CustomFieldValueChanged } from "./custom-field-value-changed"
import { DateTimeBasedTrigger } from "./date-time-based-trigger"

export const ConditionEditor = ({
  parentName,
  type,
  workspaceId,
}: {
  parentName: string
  type: TriggerEventType
  workspaceId?: string
}) => {
  const tagOptions = useTagSelectOptions()
  const form = useFormContext()
  const t = useTranslations()
  const [postOptions, setPostOptions] = useState<SelectOption[]>([])
  const [loadingPosts, setLoadingPosts] = useState(false)

  useEffect(() => {
    if (type !== triggerEventTypes.enum.commentReceived || !workspaceId) {
      return
    }

    let cancelled = false
    setLoadingPosts(true)
    client.triggersAPI
      .listCommentPostsAuthenticatedAPI({ workspaceId })
      .then(({ data }) => {
        if (!cancelled) {
          setPostOptions(
            data.map((post) => ({ label: post.name, value: post.id })),
          )
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingPosts(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [type, workspaceId])

  switch (type) {
    case triggerEventTypes.enum.tagApplied:
    case triggerEventTypes.enum.tagRemoved: {
      return (
        <SelectField name={`${parentName}.sourceId`} options={tagOptions} />
      )
    }
    case triggerEventTypes.enum.dateTimeBasedTrigger:
      return <DateTimeBasedTrigger parentName={parentName} />
    case triggerEventTypes.enum.customFieldValueChanged:
      return <CustomFieldValueChanged parentName={parentName} />
    case triggerEventTypes.enum.commentReceived:
      return (
        <>
          <InputField type="hidden" {...form.register(`${parentName}.id`)} />
          <InputField type="hidden" {...form.register(`${parentName}.type`)} />
          {postOptions.length > 0 ? (
            <SelectField
              allowClear
              clearLabel={t("trigger.conditions.allPosts")}
              label={t("trigger.conditions.postId")}
              name={`${parentName}.sourceId`}
              options={postOptions}
              placeholder={t("trigger.conditions.postIdPlaceholder")}
            />
          ) : (
            <InputField
              disabled={loadingPosts}
              label={t("trigger.conditions.postId")}
              placeholder={t("trigger.conditions.postIdPlaceholder")}
              {...form.register(`${parentName}.sourceId`)}
            />
          )}
          <InputField
            type="hidden"
            {...form.register(`${parentName}.operator`)}
          />
          <InputField type="hidden" {...form.register(`${parentName}.value`)} />
        </>
      )
    default:
      return (
        <>
          <InputField type="hidden" {...form.register(`${parentName}.id`)} />
          <InputField type="hidden" {...form.register(`${parentName}.type`)} />
          <InputField
            type="hidden"
            {...form.register(`${parentName}.sourceId`)}
          />
          <InputField
            type="hidden"
            {...form.register(`${parentName}.operator`)}
          />
          <InputField type="hidden" {...form.register(`${parentName}.value`)} />
        </>
      )
  }
}
