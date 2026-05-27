import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios"
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import z from "zod";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"
import { SignInButton, SignUpButton, useAuth, useClerk } from "@clerk/react";
const formschema = z.object({
  value: z
    .string()
    .min(1, "message is required")
    .max(10000, "message is too big"),
});

function Auth() {
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate()
  const {isSignedIn,getToken}  = useAuth()
  const form = useForm<z.infer<typeof formschema>>({
    resolver: zodResolver(formschema),
    defaultValues: {
      value: "",
    },
    mode: "onChange",
  });


  useEffect(() => {
  if (!isSignedIn) return;

  const syncUser = async () => {
    const token = await getToken();
    await axios.post(`http://localhost:4000/create-user`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  };

  syncUser();
}, [isSignedIn])

  const mutation = useMutation({
    mutationFn: async (query: string) => {
      const token = await getToken();
      return axios.post(`http://localhost:4000/api/create-conversation`, { query },
        { headers: {
          Authorization: `Bearer ${token}`,
        }}
      )
    },
  })

  const isPending = mutation.isPending;

  const isDisabled =
    isPending || !form.formState.isValid;

  const onSubmit = (
    data: z.infer<typeof formschema>
  ) => {

    if(!isSignedIn) {
      navigate("/sign-in")
      return;
    }
    mutation.mutate(data.value, {
      onSuccess: (data) => {
        navigate(`/conversation/${data.data.conversationId}`)
      },
      onError: (e) => {
        toast.error(e.message)
      }
    })

  };


  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="fixed z-10 mx-auto ml-10 flex w-full max-w-3xl items-center justify-start py-6">
        <span className="font-semibold text-2xl text-blue-500 tracking-tight">
          Purplexity
        </span>

      </div>
      <div className="flex justify-end gap-4 p-4">

        <SignUpButton mode="modal"><button type="button" className="font-normal text-lg text-blue-500 cursor-pointer">Sign Up </button></SignUpButton>

        <SignInButton mode="modal"><button type="button" className="font-normal text-lg text-blue-500 cursor-pointer">Sign In</button></SignInButton>

      </div>

      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,#1e293b,transparent_40%),radial-gradient(circle_at_bottom_right,#312e81,transparent_35%)]" />

      {/* Glow blobs */}
      <div className="absolute pointer-events-none top-[-120px] left-[-120px] h-[320px] w-[320px] rounded-full bg-blue-500/20 blur-3xl" />

      <div className="absolute pointer-events-none bottom-[-120px] right-[-120px] h-[320px] w-[320px] rounded-full bg-violet-500/20 blur-3xl" />

      {/* Grid overlay */}
      <div className="absolute pointer-events-none inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex w-full items-center justify-center p-4">
        <div className="max-w-3xl mx-auto w-full">
          <section className="space-y-6">
            {/* Heading */}
            <div className="space-y-3 text-center">
              <h1 className="text-5xl font-semibold tracking-tight text-white">
                Ask anything
              </h1>

              <p className="text-zinc-400 text-sm md:text-base">

              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className={cn(
                "relative border border-white/10 bg-white/5 backdrop-blur-xl p-4 pt-1 w-full rounded-2xl transition-all shadow-2xl",
                isFocused &&
                "border-white/20 shadow-white/10"
              )}
            >
              <TextareaAutosize
                {...form.register("value")}
                onFocus={() => setIsFocused(true)}
                disabled={isPending}
                onBlur={() => setIsFocused(false)}
                minRows={4}
                maxRows={8}
                aria-invalid={
                  !!form.formState.errors.value
                }
                className="pt-4 resize-none border-none w-full outline-none bg-transparent text-base leading-relaxed text-white placeholder:text-zinc-500"
                placeholder="What would you like to build?"
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    (e.ctrlKey || e.metaKey)
                  ) {
                    e.preventDefault();
                    form.handleSubmit(onSubmit)();
                  }
                }}
              />

              {/* Error */}
              {form.formState.errors.value && (
                <p className="text-sm text-red-400 mt-2">
                  {
                    form.formState.errors.value
                      .message
                  }
                </p>
              )}

              {/* Footer */}
              <div className="flex gap-x-2 items-end justify-between pt-4">
                <div className="text-[10px] text-zinc-500 font-mono">
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-zinc-400">
                    <span>⌘</span> Enter
                  </kbd>

                  <span className="ml-2">
                    to submit
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={isDisabled}
                  className={cn(
                    "size-9 rounded-full bg-white text-black hover:bg-zinc-200 transition",
                    isDisabled &&
                    "bg-zinc-700 text-zinc-400 hover:bg-zinc-700"
                  )}
                >
                  {isPending ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    <ArrowUpIcon className="size-4" />
                  )}
                </Button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Auth;





































