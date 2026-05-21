import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, email, estaActivo, rol_id, creado_en')
      .eq('rol_id', 2) // rol_id = 2 es admin (según schema)
      .order('creado_en', { ascending: false })

    if (error) throw new Error(`Error al obtener administradores: ${error.message}`)

    const admins = (data || []).map((admin: any) => ({
      id: admin.id,
      nombre: admin.nombre,
      email: admin.email,
      username: admin.email.split('@')[0],
      estado: admin.estaActivo ? 'activo' : 'inactivo',
      created_at: admin.creado_en,
    }))

    return NextResponse.json({
      success: true,
      data: admins,
    })
  } catch (error) {
    console.error('Error fetching admins:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener administradores',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.email || !body.nombre) {
      return NextResponse.json(
        { success: false, error: 'Email y nombre requeridos' },
        { status: 400 }
      )
    }

    if (!body.password) {
      return NextResponse.json(
        { success: false, error: 'Contraseña requerida' },
        { status: 400 }
      )
    }

    // Verificar que el email no exista
    const { data: existingUser } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', body.email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'El email ya existe' },
        { status: 400 }
      )
    }

    // Llamar al microservicio Java para crear el usuario admin
    const AUTH_BASE_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL
    const AUTH_BASE_PATH = process.env.NEXT_PUBLIC_AUTH_SERVICE_BASE_PATH || '/api/v1/auth'
    const AUTH_SERVICE_URL = `${AUTH_BASE_URL}${AUTH_BASE_PATH}`

    const registerResponse = await fetch(`${AUTH_SERVICE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
        name: body.nombre,
        phoneNumber: body.phoneNumber || null,
        roles: [{ roleName: 'ROLE_ADMIN' }],
      }),
    })

    if (!registerResponse.ok) {
      const error = await registerResponse.json().catch(() => ({}))
      throw new Error(error.message || 'Error al registrar en el microservicio')
    }

    // Si llegamos aquí, el usuario fue creado en el microservicio
    // Ahora obtener el usuario de Supabase
    const { data: newAdmin } = await supabase
      .from('usuarios')
      .select('id, nombre, email, estaActivo, rol_id, creado_en')
      .eq('email', body.email)
      .single()

    if (!newAdmin) {
      throw new Error('Usuario creado en microservicio pero no sincronizado en BD')
    }

    const admin = {
      id: newAdmin.id,
      nombre: newAdmin.nombre,
      email: newAdmin.email,
      username: newAdmin.email.split('@')[0],
      estado: newAdmin.estaActivo ? 'activo' : 'inactivo',
    }

    return NextResponse.json(
      {
        success: true,
        data: admin,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear administrador',
      },
      { status: 500 }
    )
  }
}
