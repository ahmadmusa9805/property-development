import config from '../config';
import { USER_ROLE } from '../modules/User/user.constant';
import { User } from '../modules/User/user.model';

const superUser = {
  name: {
    firstName: 'Super',
    lastName: 'Admin',
  },
  email: 'ahmadmusa9805@gmail.com',
  password: config.super_admin_password || 'superAdmin12345',
  needsPasswordChange: false,
  contactNo: "01624869805",
  role: USER_ROLE.superAdmin,
  status: 'active',
  isDeleted: false,
};

const seedSuperAdmin = async () => {
  //when database is connected, we will check is there any user who is super admin
  const isSuperAdminExits = await User.findOne({ role: USER_ROLE.superAdmin });

  if (!isSuperAdminExits) {
    await User.create(superUser);
  }
};

export default seedSuperAdmin;
