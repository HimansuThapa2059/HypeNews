import {
  createFileRoute,
  Link,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
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
import { FieldInfo } from "@/components/field-info";
import { signinFormSchema } from "@/shared/validators";
import { getErrorMessage } from "@/utils/getZodErrorMessage";
import { Google } from "@/components/logos/google";
import { GitHub } from "@/components/logos/github";
import { authClient } from "@/lib/auth";
import { toast } from "sonner";

const loginSearchSchema = z.object({
  redirect: z.string().optional().default("/"),
});

export const Route = createFileRoute("/auth/login")({
  component: Login,
  validateSearch: (search) => loginSearchSchema.parse(search),
});

function Login() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: { onSubmit: signinFormSchema },

    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        { email: value.email, password: value.password },
        {
          onSuccess: async () => {
            toast.success("Welcome back!", {
              description: "You have been logged in successfully.",
            });
            await queryClient.invalidateQueries({ queryKey: ["user"] });
            router.invalidate();
            await navigate({ to: search.redirect });
          },
          onError: async ({ error }) => {
            toast.error("Login failed", {
              description:
                error.message || "There was a problem logging you in",
            });
          },
        }
      );
    },
  });

  const renderField = (
    name: "email" | "password",
    type: string,
    placeholder: string
  ) => (
    <form.Field
      name={name}
      children={(field) => {
        const isInvalid =
          field.state.meta.isTouched && !field.state.meta.isValid;
        return (
          <div className="grid gap-2 sm:gap-4" data-invalid={isInvalid}>
            <Label htmlFor={field.name}>
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Label>
            <Input
              id={field.name}
              type={type}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder={placeholder}
              aria-invalid={isInvalid}
            />
            {isInvalid && (
              <FieldInfo message={getErrorMessage(field.state.meta.errors)} />
            )}
          </div>
        );
      }}
    />
  );

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Card className="max-w-md w-full border border-border/20 rounded-2xl shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <CardHeader className="text-center gap-1 sm:gap-2 py-2">
            <CardTitle className="text-2xl font-semibold">
              Log In to HypeNews
            </CardTitle>
            <CardDescription>
              Please enter your details to log in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-6 py-4">
            <div className="grid gap-5">
              {renderField("email", "email", "Enter your email")}
              {renderField("password", "password", "Enter your password")}
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit}
                    className="w-full h-10 mt-2 cursor-pointer"
                  >
                    {isSubmitting ? "..." : "Log In to HypeNews"}
                  </Button>
                )}
              />
            </div>
            <div className="flex items-center">
              <div className="flex-1 h-px bg-border" />
              <span className="px-3 text-xs text-muted-foreground">OR</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-3 w-full cursor-pointer"
                onClick={() => {
                  authClient.signIn.social({ provider: "google" });
                }}
              >
                <Google className="w-5 h-5" /> Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-3 w-full cursor-pointer"
                onClick={() => {
                  authClient.signIn.social({ provider: "github" });
                }}
              >
                <GitHub className="w-5 h-5" /> GitHub
              </Button>
            </div>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/auth/signup" search={search} className="underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
