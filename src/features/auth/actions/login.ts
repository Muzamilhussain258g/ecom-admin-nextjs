// "use server"

// import axios from "axios"
// import { cookies } from "next/headers"
// import { z } from "zod"
// import { authApi } from "@/features/auth/api/auth.api"
// import { loginSchema } from "@/features/auth/auth.schema"
// import { LoginCredentials } from "../types"

// const sessionSchema = z.object({
//   accessToken: z.string().min(1),
//   refreshToken: z.string().min(1),
// })

// export async function login(loginPayload: LoginCredentials) {

//     return await authApi.login(loginPayload)
    
// }
