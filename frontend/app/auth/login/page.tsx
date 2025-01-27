
import { login } from "@/app/utils/Api/Actions/Security";
import AuthContainer from "@/components/Auth/ContainerAuth";


const formInfoWithoutPassword = {
  firstLabel: "username",
  firstName: "username",
  firstPlaceHolder: "Enter your username",
  secondLabel: "password",
  secondName: "password",
  secondPlaceHolder: "Enter your password",
  textButton: "login",
  password: false, // No third field required
};

function Login() {
  return (
    <AuthContainer
      information={formInfoWithoutPassword}
      actionAuth={login}
    />
  );

}

export default Login;