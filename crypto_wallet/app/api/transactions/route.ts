// pages/api/transactions.js

let transactions : any[] = []; // Store transactions in-memory

export async function GET() {
  
    return Response.json( transactions );
  
}

export async function POST(req: any){
    const {transaction} = await req.json();
   
    if (transaction) {
      transactions.push(transaction);
      return Response.json({ message: "Transaction added successfully!" });
    } else {
      return  Response.json({ message: "Transaction is required" });
    }
}
