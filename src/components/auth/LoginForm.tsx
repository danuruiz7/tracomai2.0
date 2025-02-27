"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/AuthContext"
import { Bot } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function LoginForm() {
  const [email, setEmail] = useState("admin@admin.com")
  const [password, setPassword] = useState("1234")
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    //TODO: Quitar esto
    await new Promise((resolve) => setTimeout(resolve, 3000));

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log(res);

      if (!res.ok) {
        const errorData = await res.json(); // Intenta obtener el mensaje del servidor
        throw new Error(errorData.error || `Error ${res.status}`);
      }

      const result = await res.json();
      console.log(result);

      login(result.token); // Guarda el token en el contexto
      router.push("/dashboard"); // Redirige al dashboard
    } catch (error: any) {
      console.log(error);
      // Si el error tiene un mensaje, úsalo; de lo contrario, establece un mensaje genérico
      setError(error.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      {loading ? (
        <div className="flex flex-col justify-center items-center h-screen text-2xl">
          <Bot size={200} className=" text-dolibarr animate-bounce" />
          <p className="text-center animate-pulse font-semibold">Iniciando sesión...</p>
        </div>
      ) : (
        <Card className="w-full max-w-md mx-auto mt-20">
          <CardHeader className="pb-4 flex justify-between items-center gap-2">
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription
              className={`px-2 py-1 rounded ${error ? "bg-red-500 text-white" : ""}`}
            >
              {error
                ? "Credenciales incorrectas"
                : "Ingresa tus credenciales para acceder a tu cuenta."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={error ? "border-red-500" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={error ? "border-red-500" : ""}
                />
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button
              disabled={loading}
              type="submit"
              className="w-full"
              onClick={handleSubmit}
            >
              {loading ? "Cargando..." : "Iniciar Sesión"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </>
  );


  // return (
  //   <Card className="w-full max-w-md mx-auto mt-20">
  //     <CardHeader className="pb-4 flex justify-between items-center gap-2">
  //       <CardTitle>Iniciar Sesión</CardTitle>
  //       <CardDescription className={`px-2 py-1 rounded ${error ? "bg-red-500 text-white" : ""}`}>{error ? "Credenciales incorrectas" : "Ingresa tus credenciales para acceder a tu cuenta."}</CardDescription>
  //     </CardHeader>
  //     <CardContent>
  //       <form onSubmit={handleSubmit} className="space-y-4">
  //         <div className="space-y-2">
  //           <Label htmlFor="email">Correo electrónico</Label>
  //           <Input
  //             id="email"
  //             type="email"
  //             placeholder="tu@ejemplo.com"
  //             value={email}
  //             onChange={(e) => setEmail(e.target.value)}
  //             required
  //             className={error ? "border-red-500" : ""}
  //           />

  //         </div>
  //         <div className="space-y-2">
  //           <Label htmlFor="password">Contraseña</Label>
  //           <Input
  //             id="password"
  //             type="password"
  //             placeholder="••••••••"
  //             value={password}
  //             onChange={(e) => setPassword(e.target.value)}
  //             required
  //             className={error ? "border-red-500" : ""}
  //           />

  //         </div>
  //       </form>
  //     </CardContent>
  //     <CardFooter>
  //       <Button disabled={loading} type="submit" className="w-full" onClick={handleSubmit}>
  //         {
  //           loading ? (<>
  //             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  //             Iniciando Sesion...</>
  //           ) : "Iniciar Sesión"
  //         }
  //       </Button>
  //     </CardFooter>
  //   </Card>
  // )


}