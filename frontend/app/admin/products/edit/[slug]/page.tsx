// import {
//   fetchAdminProductDetails,
//   updateProductAction,
//   updateProductImageAction,
// } from "@/app/utils/actions"; // PRIMA
import {
  fetchAdminProductDetails,
  updateProductAction,
  updateProductImageAction,
} from "@/app/utils/Api/Actions/Products";

import FormContainer from "@/components/form/FormContainer";
import FormInput from "@/components/form/FormInput";
import PriceInput from "@/components/form/PriceInput";
import TextAreaInput from "@/components/form/TextAreaInput";
import { SubmitButton } from "@/components/form/Buttons";
import CheckboxInput from "@/components/form/CheckBoxInput";
import ImageInputContainer from "@/components/form/ImageInputContainer";

import type { Metadata, ResolvingMetadata } from 'next'
 
type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}
 
export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
    const id = (await params).slug
 
  // fetch data
 
  return {
    title: id
  }
}
// THIS PAGE IS COMPONENT IS FOR EDIT THE PRODUCT BUT HERE I HAVE 2 FORM AND EACH ONE HAS ITS STATES (FORM TO EDIT THE IMAGE, FORM TO EDIT THE WHOLE PRODUCT ) i dont have  form inside other i cant do tht 
  export type paramsType = Promise<{ slug: string }>;
export default async function PhotoPage(props: { params: paramsType }) {
  const { slug: id } = await props.params;
  const product = await fetchAdminProductDetails(id);
  const { name, company, description, featured, price } = product;
  return (
    <section>
      <h1 className="text-2xl font-semibold mb-8 capitalize">update product</h1>
      <div className="border p-8 rounded-md">
        {/* Here im getting container that will show the container to show the image til' the form is visible*/}
        <ImageInputContainer
          action={updateProductImageAction} // here im passing the action to the container (form)
          name={name}
          image={product.image}
          text="update image"
              >
                {/* THIS COMPONENT WONT BE SHOWN IN THE CLIENT, THERE ARE PASSED THE DATA OF THE FORM I HAVE 2 WAYS TO PASS THE VALUES TO THE ACTION OF THE FORM */}
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="url" value={product.image} />
              </ImageInputContainer>
              
              {/* THI'S THE FORM TO UPDATE  INFOMRATION BOUT' PRODUCT */}
        <FormContainer action={updateProductAction}>
          <div className="grid gap-4 md:grid-cols-2 my-4">
            <input type="hidden" name="id" value={id} />
            <FormInput
              type="text"
              name="name"
              label="product name"
              defaultValue={name}
            />
            <FormInput
              type="text"
              name="company"
              label="company"
              defaultValue={company}
            />

            <PriceInput defaultValue={price} />
          </div>
          <TextAreaInput
            name="description"
            labelText="product description"
            defaultValue={description}
          />
          <div className="mt-6">
            <CheckboxInput
              name="featured"
              label="featured"
              defaultChecked={featured}
            />
                  </div>
                {/*if in the form i have a button this by default will trigger the action that it's linked */}
          <SubmitButton text="update product" className="mt-8" />
        </FormContainer>
      </div>
    </section>
  );
}
