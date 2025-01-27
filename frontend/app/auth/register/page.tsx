
import AuthContainer from "@/components/Auth/ContainerAuth";
import { register } from "@/app/utils/Api/Actions/Security";


const formInfo = {
  firstLabel: "Username",
  firstName: "username",
  firstPlaceHolder: "Enter your username",
  secondLabel: "password",
  secondName: "password",
  secondPlaceHolder: "Enter your Password",
  textButton: "Register",
  password: false
};

function Register() {
  return (
    <>
      <AuthContainer information={formInfo} actionAuth={register} />
    </>
  );
}

export default Register;

