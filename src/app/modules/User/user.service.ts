/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// import mongoose from 'mongoose';

import { TUser } from './user.interface';
import { User } from './user.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { usersSearchableFields } from './user.constant';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { Quote } from '../Quote/quote.model';
import { CallBooking } from '../CallBooking/CallBooking.model';

export const createUserIntoDB = async (payload: TUser) => {

if(payload.role === 'client'){
  if(!payload.password){
    payload.password = 'client12345';
   }

}
if(payload.role === 'admin'){
  if(!payload.password){
    payload.password = 'admin12345';
   }
}
    const newUser = await User.create(payload);
    if (!newUser) throw new Error('Failed to create user');
    
    return newUser;
};

const getMe = async (userEmail: string) => {
  const result = await User.findOne({ email: userEmail , isDeleted: false });

  return result;
};
const getSingleUserIntoDB = async (id: string) => {
  const result = await User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id), isDeleted: false } },
    {
      $lookup: {
        from: 'quotes', // The MongoDB collection name (usually lowercase plural)
        localField: '_id',
        foreignField: 'userId',
        as: 'quotes',
      },
    },
  ]);

  return result.length ? result[0] : null;
};

// const getSingleUserIntoDB = async (id: string) => {
//   const result = await User.findOne({ _id: id, isDeleted: false }).populate('Quote');

//   return result;
// };
const getAllUsersFromDB = async (query: Record<string, unknown>) => {
  const studentQuery = new QueryBuilder(User.find({ isDeleted: false, role: { $ne: 'superAdmin' }}), query)
    .search(usersSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await studentQuery.countTotal();
  const result = await studentQuery.modelQuery;

  return {
    meta,
    result,
  };
};
const getAllAdminUsersFromDB = async (query: Record<string, unknown>) => {
  const studentQuery = new QueryBuilder(User.find({status: 'active',role: 'admin', isDeleted: false}), query)
    .search(usersSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await studentQuery.countTotal();
  const result = await studentQuery.modelQuery;

  return {
    meta,
    result,
  };
};
const getUsersMonthlyFromDB = async () => {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1); // January 1st, current year
  const endOfYear = new Date(new Date().getFullYear() + 1, 0, 1); // January 1st, next year

  const result = await User.aggregate([
    {
      $match: {
        status: 'active',
        isDeleted: false,
        createdAt: { $gte: startOfYear, $lt: endOfYear } // Filter users created in the current year
      }
    },
    {
      $group: {
        _id: { $month: "$createdAt" }, // Group by month of 'createdAt'
        count: { $sum: 1 } // Count users per month
      }
    },
    {
      $sort: { _id: 1 } // Sort by month in ascending order
    }
  ]);

  // Format result to include month names (optional)
  const formattedResult = result.map(item => ({
    month: new Date(0, item._id - 1).toLocaleString('default', { month: 'long' }),
    count: item.count
  }));

  return formattedResult;
};


const changeStatus = async (id: string, payload: { status: string }) => {
  const result = await User.findByIdAndUpdate(id, payload, {
    new: true,
  });
    // if(result?.status === 'blocked'){
    //   if(result?.role === 'client'){
    //      await Client.findOneAndUpdate({userId: result?._id}, {status: 'blocked'}, {new: true}).populate('userId');
    //    }
       
    //    if(result?.role === 'admin'){
    //     await Admin.findOneAndUpdate({userId: result?._id}, {status: 'blocked'}, {new: true}).populate('userId');
    //   }

     
    // }

    // if(result?.status === 'active'){
    //   if(result?.role === 'client'){
    //      await Client.findOneAndUpdate({userId: result?._id}, {status: 'active'}, {new: true}).populate('userId');
    //    }
       
    //    if(result?.role === 'admin'){
    //     await Admin.findOneAndUpdate({userId: result?._id}, {status: 'active'}, {new: true}).populate('userId');
    //   }

     
    // }




  return result;
};


const updateUserIntoDB = async (id: string, payload: Partial<TUser>, file?: any) => {
  const { name, ...userData } = payload;

  const modifiedUpdatedData: Record<string, unknown> = { ...userData };

  if (name && Object.keys(name).length) {
    for (const [key, value] of Object.entries(name)) {
      modifiedUpdatedData[`name.${key}`] = value;
    }
  }

  // Handle file upload if present
  if (file) {
    modifiedUpdatedData.profileImg = file.location as string;
  }

  const result = await User.findByIdAndUpdate(
    id,
    modifiedUpdatedData,
    {
      new: true,
      runValidators: true,
    }
  ).select('-password');

  return result;
};

const deleteUserFromDB = async (id: string) => {
  const session = await mongoose.startSession(); // Start a session
  session.startTransaction(); // Start transaction

  try {
    // Step 1: Check if the user exists
    const user = await User.findById(id).session(session); // Find user with session
    if (!user) {
      throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
    }

    // Step 2: Delete the user
    const deletedUser = await User.findByIdAndDelete(id, { session }); // Pass session for deletion

    // Step 3: Check if a quote exists for the user
    const quote = await Quote.findOne({ userId: id }).session(session); // Check for quote with userId
    if (quote) {
     await Quote.findOneAndDelete(
        { userId: id },
        { session } // Pass session for deletion
      );
    } else {
      console.log(`No quote found for user with ID ${id}`);
    }

    // Step 4: Check if a call booking exists for the user
    const callBooking = await CallBooking.findOne({ userId: id }).session(session); // Check for call booking with userId
    if (callBooking) {
     await CallBooking.findOneAndDelete(
        { userId: id },
        { session } // Pass session for deletion
      );
    } else {
      console.log(`No call booking found for user with ID ${id}`);
    }

    // Commit the transaction if all operations succeed
    await session.commitTransaction();
    session.endSession();

    return deletedUser; // Return the deleted user document
  } catch (error) {
    // Rollback the transaction if any operation fails
    await session.abortTransaction();
    session.endSession();
    throw error; // Propagate the error to be handled by the caller
  }
};

export const UserServices = {
  getAllAdminUsersFromDB,
  getSingleUserIntoDB,
  getUsersMonthlyFromDB, 
  deleteUserFromDB,
  createUserIntoDB,
  getMe,
  changeStatus,
  getAllUsersFromDB,
  updateUserIntoDB
};
