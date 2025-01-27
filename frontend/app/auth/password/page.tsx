import AuthContainer from "@/components/Auth/ContainerAuth";
import { changePassword} from "@/app/utils/Api/Actions/Security";



const formInfo = {
  firstLabel: "Username",
  firstName: "username",
  firstPlaceHolder: "Enter your username",
  secondLabel: "Current Password",
  secondName: "currentPassword",
  secondPlaceHolder: "Enter your current password",
  thirdLabel: "New Password",
  thirdName: "newPassword",
  thirdPlaceHolder: "Enter your new password",
  textButton: "Push >",
  password: true,
  fourLabel: "Confirm New Password",
  fourName: "confirmPassword",
  fourPlaceHolder: "Re-enter your new password",
};


async function Password() {
  return (
    <>
      <AuthContainer information={formInfo} actionAuth={changePassword} />
    </>
  );
}

export default Password;
