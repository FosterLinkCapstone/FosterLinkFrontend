import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const FaqCardSkeleton = ({key} : {key: number}) => {
 return (
    <Card key={key} className="mb-4 overflow-hidden border-border">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="w-10 ml-4"></div>
                        <div className="flex-1 flex flex-col items-center">
                          <Skeleton className="h-6 w-48 mb-2" />
                          <div className="flex items-center gap-2 mt-2">
                            <Skeleton className="h-4 w-8" />
                            <Skeleton className="h-5 w-5 rounded-full" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-6 w-6 rounded-full ml-4" />
                      </div>
                    </div>
                  </Card>
 )
}