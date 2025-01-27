import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export enum Mode {
  SingleProduct = "singleProduct",
  CartItem = "cartItem",
}

/// This will represent a product
type SelectProductAmountProps = {
  mode: Mode.SingleProduct;
  amount: number;
  setAmount: (value: number) => void;
};

// This will represent' the list of items (the cart)
type SelectCartItemAmountProps = {
  mode: Mode.CartItem;
  amount: number;
  setAmount: (value: number) => Promise<void>;
  isLoading: boolean;
};

function SelectProductAmount(
  props: SelectProductAmountProps | SelectCartItemAmountProps
) {
  const { mode, amount, setAmount } = props;

  const cartItem = mode === Mode.CartItem; // true is "cartIteem", false is "singleProduct"

  return (
    <>
      <h4 className="mb-2">Amount : </h4>
      <Select
        defaultValue={amount.toString()}  
        onValueChange={(value) => setAmount(Number(value))} // Modify the quantity
        disabled={cartItem ? props.isLoading : false} // if its cartItem disable
      >
        <SelectTrigger className={cartItem ? "w-[100px]" : "w-[150px]"}>
          <SelectValue placeholder={amount} /> { /*Value selected by default*/}
        </SelectTrigger>

        <SelectContent>
          {/*if its single product onmly i can select 10 quantity max, if its car max i can select 10 plus */ }
          {Array.from({ length: cartItem ? amount + 10 : 10 }, (_, index) => {
            const selectValue = (index + 1).toString();
            return (
              <SelectItem key={index} value={selectValue}>
                {selectValue}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </>
  );
}
export default SelectProductAmount;
