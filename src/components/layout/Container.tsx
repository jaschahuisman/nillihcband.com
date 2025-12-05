import { cn } from "@/utils";

export default function Container({ children, ...props }: React.ComponentProps<'div'>) {
    return (
        <div {...props} className={cn("container mx-auto px-4 flex flex-col gap-8 max-w-5xl", props.className)}>
            {children}
        </div>
    )
}