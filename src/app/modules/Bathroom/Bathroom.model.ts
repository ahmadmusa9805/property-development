import { Schema, model } from 'mongoose';
      import { TBathroom, BathroomModel } from './Bathroom.interface';
      
      const BathroomSchema = new Schema<TBathroom, BathroomModel>({
        bathroomQuantity: { type: Number, required: true },
        price: { type: Number, required: true },
        isDeleted: { type: Boolean, default: false },
      });
      
      BathroomSchema.statics.isBathroomExists = async function (id: string) {
        return await this.findOne({ _id: id, isDeleted: false });
      };
      
      export const Bathroom = model<TBathroom, BathroomModel>('Bathroom', BathroomSchema);
      