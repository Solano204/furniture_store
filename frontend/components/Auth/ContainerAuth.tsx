import FormContainer from "@/components/form/FormContainer";
import FormInput from "@/components/form/FormInput";
import { SubmitButton } from "@/components/form/Buttons";
import { actionFunction } from "@/app/utils/types";

// Define your FormInformation types
type FormInformation = {
  firstLabel: string;
  firstName: string;
  firstPlaceHolder: string;
  secondLabel: string;
  secondName: string;
  secondPlaceHolder: string;
  textButton: string;
  password: boolean; // Indicates that this type requires the additional fields
  thirdName?: string;
  thirdLabel?: string;
  thirdPlaceHolder?: string;
  fourName?: string;
  fourLabel?: string;
  fourPlaceHolder?: string;
};



// Update the component to destructure `props`
function AuthContainer({
  information,
  actionAuth,
}: {
  information: FormInformation;
  actionAuth: actionFunction;
}) {
  return (
    <section className="border p-8 rounded-md flex justify-center items-start w-full h-[750px]">
      {/* The parent container ensures proper alignment */}
      <FormContainer action={actionAuth}>
        <div className="grid gap-4 my-4 sm:w-[550px] md:w-[580px] lg:w-[600px]">
          {/* Render default inputs */}
          <FormInput
            type="text"
            name={information.firstName}
            label={information.firstLabel}
            placeholder={information.firstPlaceHolder}
            className="mx-auto w-[70%]"
          />
          <FormInput
            type="text"
            name={information.secondName}
            label={information.secondLabel}
            placeholder={information.secondPlaceHolder}
            className="mx-auto w-[70%]"
          />

          {/* Conditionally render additional input for password */}
          {information.password && (
            <>
              <FormInput
                type="password"
                name={information.thirdName}
                label={information.thirdLabel}
                placeholder={information.thirdPlaceHolder}
                className="mx-auto w-[70%]"
              />
              <FormInput
                type="password"
                name={information.fourName}
                label={information.fourLabel}
                placeholder={information.fourPlaceHolder}
                className="mx-auto w-[70%]"
              />
            </>
          )}

          {/* Submit Button */}
          <SubmitButton
            text={information.textButton}
            className="mt-8 mx-auto w-[20%]"
          />
        </div>
      </FormContainer>
    </section>
  );
}

export default AuthContainer;
