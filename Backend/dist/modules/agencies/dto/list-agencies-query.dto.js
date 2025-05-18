"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListAgenciesQuerySchema = void 0;
// src/modules/agencies/dto/list-agencies-query.dto.ts
const zod_1 = require("zod");
const user_enums_1 = require("@/modules/users/enums/user.enums"); // Or your shared enum location
// This is the robust pattern for an optional input string that defaults
// to another string if undefined, then is refined and transformed to a number.
const numericStringWithDefaultAndTransform = (defaultValueAsString) => {
    return zod_1.z.string()
        .optional() // Input string is optional
        .default(defaultValueAsString) // If input string is undefined, default to this string
        .refine(val => !isNaN(parseFloat(val)), { message: 'Must be a numeric string.' }) // Refine the string
        .transform(val => parseInt(val, 10)); // Transform the (possibly defaulted) string to a number
};
exports.ListAgenciesQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: numericStringWithDefaultAndTransform("1")
            .refine(val => val > 0, { message: 'Page must be positive' }), // val here is a number
        limit: numericStringWithDefaultAndTransform("10")
            .refine(val => val > 0, { message: 'Limit must be positive' }), // val here is a number
        status: zod_1.z.nativeEnum(user_enums_1.ResourceStatus).optional(),
        search: zod_1.z.string().min(1).optional(),
        sortBy: zod_1.z.string().optional().default('createdAt'),
        sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
    }),
});
// // src/modules/agencies/dto/list-agencies-query.dto.ts
// import { z } from 'zod';
// import { ResourceStatus } from '@/modules/users/enums/user.enums'; // Or your shared enum location
// // Corrected utility pattern from the users DTO
// const numericStringParserForDefault = z.string()
//   .optional(); // Input string is optional
// const numericStringTransformer = z.string()
//   .refine(val => !isNaN(parseFloat(val)), { message: 'Must be a numeric string.' })
//   .transform(val => parseInt(val, 10));
// // Utility for creating an optional numeric string schema with an optional default (outputting a number)
// const optionalNumericWithDefault = (defaultValue?: number) => {
//   // Base schema: takes an optional string, applies a default string if input is undefined, then transforms
//   let schema = numericStringParserForDefault;
//   if (defaultValue !== undefined) {
//     schema = schema.default(String(defaultValue)); // Default the *input string*
//   }
//   // Now transform the (possibly defaulted) string to a number.
//   // If the input was undefined and no default, it remains undefined.
//   // If input was undefined and had a default string, that string is transformed.
//   // If input was a string, that string is transformed.
//   return schema.pipe(numericStringTransformer.optional());
//   // Using .pipe() ensures the transformations happen correctly.
//   // We make the transformer's output optional again in case the input string was undefined and no default string was set.
//   // A slightly simpler way if a default value means the field is no longer truly optional in output:
//   // if (defaultValue !== undefined) {
//   //   return z.string().optional().default(String(defaultValue)).pipe(numericStringTransformer);
//   // }
//   // return z.string().optional().pipe(numericStringTransformer.optional()); // If truly optional output
// };
// // A more direct approach that was finalized for users DTO:
// const numericStringWithDefaultAndTransform = (defaultValueAsString: string) => {
//   return z.string()
//     .optional() // Input string is optional
//     .default(defaultValueAsString) // If input string is undefined, default to this string
//     .refine(val => !isNaN(parseFloat(val)), { message: 'Must be a numeric string.' }) // Refine the string
//     .transform(val => parseInt(val, 10)); // Transform the (possibly defaulted) string to a number
// };
// export const ListAgenciesQuerySchema = z.object({
//   query: z.object({
//     // Use the more direct and robust approach:
//     page: numericStringWithDefaultAndTransform("1")
//             .refine(val => val > 0, { message: 'Page must be positive' }),
//     limit: numericStringWithDefaultAndTransform("10")
//             .refine(val => val > 0, { message: 'Limit must be positive' }),
//     status: z.nativeEnum(ResourceStatus).optional(),
//     search: z.string().min(1).optional(),
//     sortBy: z.string().optional().default('createdAt'),
//     sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
//   }),
// });
// export type ListAgenciesQueryDto = z.infer<typeof ListAgenciesQuerySchema>['query'];
// // import { z } from 'zod';
// // import { ResourceStatus } from '@/modules/users/enums/user.enums'; // Or a shared enum location
// // // Re-using the numeric string parser logic from users DTO or define locally
// // const numericStringParser = z.string()
// //   .refine(val => !isNaN(parseFloat(val)), { message: 'Must be a numeric string.' })
// //   .transform(val => parseInt(val, 10));
// // const optionalNumericWithDefault = (defaultValue?: number) => {
// //   if (defaultValue !== undefined) {
// //     return numericStringParser.optional().default(defaultValue);
// //   }
// //   return numericStringParser.optional();
// // };
// // export const ListAgenciesQuerySchema = z.object({
// //   query: z.object({
// //     page: optionalNumericWithDefault(1)
// //             .refine(val => val === undefined || val > 0, { message: 'Page must be positive' }),
// //     limit: optionalNumericWithDefault(10)
// //             .refine(val => val === undefined || val > 0, { message: 'Limit must be positive' }),
// //     status: z.nativeEnum(ResourceStatus).optional(),
// //     search: z.string().min(1).optional(),
// //     sortBy: z.string().optional().default('createdAt'),
// //     sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
// //   }),
// // });
// // export type ListAgenciesQueryDto = z.infer<typeof ListAgenciesQuerySchema>['query'];
