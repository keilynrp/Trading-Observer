
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface TradeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: "buy" | "sell";
    symbol: string;
    price: number;
    onSuccess?: () => void;
}

export function TradeDialog({ open, onOpenChange, type, symbol, price, onSuccess }: TradeDialogProps) {
    const [quantity, setQuantity] = useState("1");
    const [loading, setLoading] = useState(false);

    const total = parseFloat(quantity) * price;

    const handleTrade = async () => {
        if (!quantity || isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0) {
            toast.error("Please enter a valid quantity");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/positions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    symbol,
                    type: type,
                    quantity: parseFloat(quantity),
                    entryPrice: price
                })
            });

            if (res.ok) {
                toast.success(`${type.toUpperCase()} Order Executed`, {
                    description: `Successfully ${type === 'buy' ? 'bought' : 'sold'} ${quantity} ${symbol} at $${price.toFixed(2)}`
                });
                onOpenChange(false);
                if (onSuccess) onSuccess();
            } else {
                toast.error("Trade failed");
            }
        } catch (error) {
            toast.error("Failed to execute trade");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="capitalize">{type} {symbol}</DialogTitle>
                    <DialogDescription>
                        Execute a {type} order for {symbol} at current market price.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">
                            Price
                        </Label>
                        <div className="col-span-3 font-mono">
                            ${price.toFixed(2)}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="quantity" className="text-right">
                            Quantity
                        </Label>
                        <Input
                            id="quantity"
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-bold">
                            Total
                        </Label>
                        <div className="col-span-3 font-mono font-bold text-lg">
                            ${isNaN(total) ? "0.00" : total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button
                        onClick={handleTrade}
                        disabled={loading}
                        className={type === "buy" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm {type.toUpperCase()}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
