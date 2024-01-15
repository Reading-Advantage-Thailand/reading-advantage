import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Icons } from "../../../../components/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { headers } from "next/headers";

type Props = {
//   userId: string;
  // levelTestData: any,
};

async function getLevelTestData() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/level-test`,
    {
      method: "GET",
      headers: headers(),
    }
  );
  return res.json();
}

export default async function FirstRunLevelTest({  }: Props) {
  // const [loading, setLoading] = useState(false);
  const resGeneralDescription = await getLevelTestData();


  return (
    <>
      <Dialog>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-bold text-2xl md:text-2xl">
              Please select your language
            </DialogTitle>
          </DialogHeader>
          <DialogFooter></DialogFooter>
        </DialogContent>
      </Dialog>
      {/* <Card>
            <CardContent>
            <CardTitle className='font-bold text-2xl md:text-2xl'>
                        Please select your language
                    </CardTitle>
            </CardContent>
        </Card> */}
      <Card>
        <CardHeader>
          <CardTitle className="font-bold text-2xl md:text-2xl">
            Let&apos;s get start by testing your skill!
          </CardTitle>
          <CardDescription>
            Choose the correct answer to assess your reading level.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <pre>{JSON.stringify(resGeneralDescription, null, 2)}</pre>
          </div>
          <div>content show here</div>
        </CardContent>
      </Card>
      <div className="flex items-center pt-4">
        <Button
          size="lg"
          // disabled={loading}
        >
          {/* {loading && (
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    )} */}
          <span>Next</span>
        </Button>
      </div>
    </>
  );
}
