"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListUsersQuerySchema = void 0;
// src/modules/users/dto/list-users-query.dto.ts
const zod_1 = require("zod");
const user_enums_1 = require("../enums/user.enums"); // Ensure this path is correct
// Utility for creating a numeric string schema that defaults and then transforms to a number
const numericStringWithDefaultAndTransform = (defaultValueAsString) => {
    return zod_1.z.string()
        .optional() // Input string is optional
        .default(defaultValueAsString) // If input string is undefined, default to this string
        .refine(val => !isNaN(parseFloat(val)), { message: 'Must be a numeric string.' }) // Refine the string
        .transform(val => parseInt(val, 10)); // Transform the (possibly defaulted) string to a number
};
// Utility for an optional numeric string that transforms (no default input)
const optionalNumericTransform = () => {
    return zod_1.z.string()
        .optional() // Input string is optional
        .refine(val => {
        if (val === undefined)
            return true; // Allow undefined to pass if optional
        return !isNaN(parseFloat(val));
    }, { message: 'Must be a numeric string if provided.' })
        .transform(val => val === undefined ? undefined : parseInt(val, 10)); // Transform to number or keep undefined
};
exports.ListUsersQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: numericStringWithDefaultAndTransform("1") // Provide default as a string
            .refine(val => val > 0, { message: 'Page must be positive' }), // Now val is guaranteed to be a number
        limit: numericStringWithDefaultAndTransform("10") // Provide default as a string
            .refine(val => val > 0, { message: 'Limit must be positive' }), // Now val is guaranteed to be a number
        role: zod_1.z.nativeEnum(user_enums_1.UserRole).optional(),
        status: zod_1.z.nativeEnum(user_enums_1.ResourceStatus).optional(),
        agencyId: zod_1.z.string().cuid('Invalid agency ID format').optional(),
        search: zod_1.z.string().min(1).optional(), // If search can be empty string vs not present, adjust
        sortBy: zod_1.z.string().optional().default('createdAt'),
        sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
    }),
});
// // src/modules/users/dto/list-users-query.dto.ts
// import { z } from 'zod';
// import { UserRole, ResourceStatus } from '../enums/user.enums'; // Ensure this path is correct
// const numericStringParser = z.string()
//   .refine(val => !isNaN(parseFloat(val)), { message: 'Must be a numeric string.' })
//   .transform(val => parseInt(val, 10));
// // Utility for creating an optional numeric string schema with an optional default (outputting a number)
// const optionalNumericWithDefault = (defaultValue?: number) => {
//   if (defaultValue !== undefined) {
//     // If a default is provided, the input can be undefined, and it will result in the defaultValue.
//     // The .default() here applies to the output of numericStringParser.
//     return numericStringParser.optional().default(defaultValue);
//   }
//   // If no default, it's just an optional numeric string.
//   return numericStringParser.optional();
// };
// export const ListUsersQuerySchema = z.object({
//   query: z.object({
//     // Use the new utility
//     page: optionalNumericWithDefault(1)
//             .refine(val => val === undefined || val > 0, { message: 'Page must be positive' }),
//     limit: optionalNumericWithDefault(10)
//             .refine(val => val === undefined || val > 0, { message: 'Limit must be positive' }),
//     role: z.nativeEnum(UserRole).optional(),
//     status: z.nativeEnum(ResourceStatus).optional(),
//     agencyId: z.string().cuid('Invalid agency ID format').optional(),
//     search: z.string().min(1).optional(),
//     sortBy: z.string().optional().default('createdAt'),
//     sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
//   }),
// });
// export type ListUsersQueryDto = z.infer<typeof ListUsersQuerySchema>['query'];
// // // src/modules/users/dto/list-users-query.dto.ts
// // import { z } from 'zod';
// // import { UserRole, ResourceStatus } from '../enums/user.enums'; // Ensure this path is correct
// // // Revised numericString utility
// // const numericString = (paramDefaultValue?: number) => { // Parameter is now optional
// //   let schema = z.string()
// //     .refine(val => !isNaN(parseFloat(val)), { message: 'Must be a numeric string.' })
// //     .transform(val => parseInt(val, 10))
// //     .optional(); // Base schema is optional
// //   if (paramDefaultValue !== undefined) {
// //     // If a default value is provided for the parameter, apply it to the Zod schema
// //     // The default value itself should be of the type *after* transformation (number)
// //     return schema.default(paramDefaultValue);
// //   }
// //   // If no default value for the parameter, return the schema as just optional
// //   return schema;
// // };
// // export const ListUsersQuerySchema = z.object({
// //   query: z.object({
// //     page: numericString(1).refine(val => val === undefined || val > 0, { message: 'Page must be positive' }),
// //     limit: numericString(10).refine(val => val === undefined || val > 0, { message: 'Limit must be positive' }),
// //     role: z.nativeEnum(UserRole).optional(),
// //     status: z.nativeEnum(ResourceStatus).optional(),
// //     agencyId: z.string().cuid('Invalid agency ID format').optional(),
// //     search: z.string().min(1).optional(),
// //     sortBy: z.string().optional().default('createdAt'), // .default('createdAt') is fine as 'createdAt' is a string
// //     sortOrder: z.enum(['asc', 'desc']).optional().default('desc'), // .default('desc') is fine
// //   }),
// // });
// // export type ListUsersQueryDto = z.infer<typeof ListUsersQuerySchema>['query'];
// // // import { z } from 'zod';
// // // import { UserRole, ResourceStatus } from '../enums/user.enums';
// // // const numericString = (defaultValue: number | undefined = undefined) =>
// // //   z.string()
// // //     .refine(val => !isNaN(parseFloat(val)), { message: 'Must be a numeric string' })
// // //     .transform(val => parseInt(val, 10))
// // //     .optional()
// // //     .default(defaultValue !== undefined ? `${defaultValue}` : undefined);
// // // export const ListUsersQuerySchema = z.object({
// // //   query: z.object({
// // //     page: numericString(1).refine(val => val === undefined || val > 0, { message: 'Page must be positive' }),
// // //     limit: numericString(10).refine(val => val === undefined || val > 0, { message: 'Limit must be positive' }),
// // //     role: z.nativeEnum(UserRole).optional(),
// // //     status: z.nativeEnum(ResourceStatus).optional(),
// // //     agencyId: z.string().cuid('Invalid agency ID format').optional(),
// // //     search: z.string().min(1).optional(), // Search by name or email
// // //     sortBy: z.string().optional().default('createdAt'), // Field to sort by
// // //     sortOrder: z.enum(['asc', 'desc']).optional().default('desc'), // Sort order
// // //   }),
// // // });
// // // export type ListUsersQueryDto = z.infer<typeof ListUsersQuerySchema>['query'];
