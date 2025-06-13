import { Injectable } from '@nestjs/common';
import { Customer } from '../dto/customer.dto';

@Injectable()
export class CustomerMapper {
  mapPrismaCustomerToDto(prismaCustomer: any): Customer {
    const customer = new Customer();
    customer.id = prismaCustomer.id;
    customer.email = prismaCustomer.email;
    customer.firstName = prismaCustomer.firstName;
    customer.lastName = prismaCustomer.lastName;
    customer.phone = prismaCustomer.phone;
    customer.dateOfBirth = prismaCustomer.dateOfBirth;
    customer.gender = prismaCustomer.gender;
    customer.address = prismaCustomer.address;
    customer.city = prismaCustomer.city;
    customer.state = prismaCustomer.state;
    customer.country = prismaCustomer.country;
    customer.postalCode = prismaCustomer.postalCode;
    customer.emergencyContactName = prismaCustomer.emergencyContactName;
    customer.emergencyContactPhone = prismaCustomer.emergencyContactPhone;
    customer.marketingOptIn = prismaCustomer.marketingOptIn;
    customer.isActive = prismaCustomer.isActive;
    customer.createdAt = prismaCustomer.createdAt;
    customer.updatedAt = prismaCustomer.updatedAt;
    return customer;
  }
}
