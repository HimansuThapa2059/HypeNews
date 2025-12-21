import { FieldInfo } from "@/components/field-info";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPost } from "@/lib/api";
import { createPostSchema } from "@/shared/types";
import { getErrorMessage } from "@/utils/getZodErrorMessage";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { defaultPostSearchParams } from "../posts.$postId";

export const Route = createFileRoute("/_protected/create-post")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      title: "",
      url: "",
      content: "",
    },
    validators: {
      onChange: createPostSchema,
      onSubmit: createPostSchema,
    },
    onSubmit: async ({ value }) => {
      const res = await createPost(value.title, value.url, value.content);

      if (res.success) {
        await queryClient.invalidateQueries({ queryKey: ["posts"] });
        router.invalidate();
        await navigate({
          to: "/posts/$postId",
          params: { postId: res.data.postId },
          search: defaultPostSearchParams,
        });
        return;
      }

      if (!res.isFormError) {
        toast.error("Failed to create post", {
          description: res.error,
        });
      }

      form.setErrorMap({
        onSubmit: res.isFormError ? res.error : "Unexpected error",
      });
    },
  });

  //TODO: prevent navigating to other pages while in middle of the post creation page

  return (
    <div className="mx-auto w-full max-w-2xl sm:mt-8 md:mt-12">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Create Post</CardTitle>
          <CardDescription>
            Got something to share? Add a title, then choose either a link or
            some content below. At least one is required to publish.
          </CardDescription>
        </CardHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <CardContent className="space-y-6">
            <form.Field name="title">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <div className="space-y-2" data-invalid={isInvalid}>
                    <Label htmlFor={field.name}>Title</Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Enter your title"
                    />
                    {isInvalid && (
                      <FieldInfo
                        message={getErrorMessage(field.state.meta.errors)}
                      />
                    )}
                  </div>
                );
              }}
            </form.Field>

            <form.Field name="url">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <div className="space-y-2" data-invalid={isInvalid}>
                    <Label htmlFor={field.name}>URL</Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="https://example.com"
                    />
                    {isInvalid && (
                      <FieldInfo
                        message={getErrorMessage(field.state.meta.errors)}
                      />
                    )}
                  </div>
                );
              }}
            </form.Field>

            <form.Field name="content">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <div className="space-y-2" data-invalid={isInvalid}>
                    <Label htmlFor={field.name}>Content</Label>
                    <textarea
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Write your content here..."
                      className="min-h-[120px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                    {isInvalid && (
                      <FieldInfo
                        message={getErrorMessage(field.state.meta.errors)}
                      />
                    )}
                  </div>
                );
              }}
            </form.Field>

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  variant="brand"
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="w-full cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                  ) : (
                    "Post"
                  )}
                </Button>
              )}
            </form.Subscribe>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
