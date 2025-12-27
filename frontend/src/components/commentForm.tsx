import { useForm } from "@tanstack/react-form";

import { toast } from "sonner";

import { createCommentSchema } from "@/shared/types";
import { useCreateComment } from "@/lib/api-hooks";

import { FieldInfo } from "./field-info";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { getErrorMessage } from "@/utils/getZodErrorMessage";
import { Loader2 } from "lucide-react";

export function CommentForm({
  id,
  isParent,
  onSuccess,
}: {
  id: number;
  isParent?: boolean;
  onSuccess?: () => void;
}) {
  const createComment = useCreateComment();
  const form = useForm({
    defaultValues: {
      content: "",
    },
    validators: {
      onChange: createCommentSchema,
    },
    onSubmit: async ({ value }) => {
      await createComment.mutateAsync(
        {
          id,
          content: value.content,
          isParent: !!isParent,
        },
        {
          onSuccess: (data) => {
            if (!data.success) {
              if (!data.isFormError) {
                toast.error("Failed to create comment", {
                  description: data.error,
                });
              }
              form.setErrorMap({
                onSubmit: data.isFormError
                  ? data.error || data.message
                  : "Something went wrong! please try again ",
              });
              throw new Error(data.error);
            } else {
              form.reset();
              onSuccess?.();
            }
          },
        }
      );
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="grid gap-2"
    >
      <form.Field
        name="content"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

          return (
            <div className="grid gap-2">
              <Textarea
                id={field.name}
                aria-label={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                placeholder="What are your thoughts?"
                rows={4}
                className="w-full p-2 text-sm"
              />
              {isInvalid && (
                <FieldInfo message={getErrorMessage(field.state.meta.errors)} />
              )}
            </div>
          );
        }}
      />
      <form.Subscribe
        selector={(state) => [state.errorMap]}
        children={([errorMap]) =>
          errorMap.onSubmit ? (
            <p className="text-[0.8rem] font-medium text-destructive/20">
              {errorMap.onSubmit}
            </p>
          ) : null
        }
      />
      <div className="flex justify-end space-x-2">
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              variant="brand"
              disabled={!canSubmit || isSubmitting}
              className="cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
              ) : (
                "Add comment"
              )}
            </Button>
          )}
        />
      </div>
    </form>
  );
}
