import { NextRequest, NextResponse } from "next/server";

export default (func: (req: NextRequest, context: any) => Promise<NextResponse>) => {
    return async (req: NextRequest, context: any) => {
        try {
            return await func(req, context);
        } catch (error) {
            if (error instanceof Error) {
                console.log(error);
                return NextResponse.json({ message: error.message }, { status: 500 });
            } else {
                console.log(error);
                return NextResponse.json({ message: 'An unknown error occurred' }, { status: 500 });
            }
        }
    };
};
