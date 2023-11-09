import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="grid w-full gap-10">
            <div className="flex w-full items-center justify-between">
                <Skeleton className="h-[45px] w-[120px]" />
                <Skeleton className="h-[20px] w-[120px]" />
                <Skeleton className="h-[20px] w-[120px]" />
            </div>
            <div className="mx-auto w-[800px] space-y-6">
                <Skeleton className="h-[100px] w-full" />
                <Skeleton className="h-[100px] w-2/3" />
                <Skeleton className="h-[100px] w-full" />
            </div>
        </div>
    )
}