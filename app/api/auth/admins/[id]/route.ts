import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const adminId = parseInt(id, 10)

    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, email, estaActivo, rol_id, creado_en')
      .eq('id', adminId)
      .eq('rol_id', 2)
      .single()

    if (error && error.code !== 'PGRST116') throw new Error(`Error al obtener administrador: ${error.message}`)
    if (!data) return NextResponse.json({ success: false, error: 'Administrador no encontrado' }, { status: 404 })

    const admin = {
      id: data.id,
      nombre: data.nombre,
      email: data.email,
      username: data.email.split('@')[0],
      estado: data.estaActivo ? 'activo' : 'inactivo',
      created_at: data.creado_en,
    }

    return NextResponse.json({
      success: true,
      data: admin,
    })
  } catch (error) {
    console.error('Error fetching admin:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener administrador',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const adminId = parseInt(id, 10)
    const body = await request.json()

    // Validar que existe y es admin
    const { data: existing } = await supabase
      .from('usuarios')
      .select('id, email')
      .eq('id', adminId)
      .eq('rol_id', 2)
      .single()

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Administrador no encontrado' }, { status: 404 })
    }

    // Si hay contraseña, debe ir al microservicio (por ahora solo permitir cambiar en Supabase directamente)
    // Actualizar solo campos permitidos
    const updates: any = {}
    if (body.nombre) updates.nombre = body.nombre
    if (body.estado !== undefined) {
      updates.estaActivo = body.estado === 'activo'
    }

    const { data, error } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', adminId)
      .select()
      .single()

    if (error) throw new Error(`Error al actualizar administrador: ${error.message}`)

    const admin = {
      id: data.id,
      nombre: data.nombre,
      email: data.email,
      username: data.email.split('@')[0],
      estado: data.estaActivo ? 'activo' : 'inactivo',
    }

    return NextResponse.json({
      success: true,
      data: admin,
    })
  } catch (error) {
    console.error('Error updating admin:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar administrador',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const adminId = parseInt(id, 10)

    // Verificar que existe
    const { data: existing } = await supabase
      .from('usuarios')
      .select('id')
      .eq('id', adminId)
      .eq('rol_id', 2)
      .single()

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Administrador no encontrado' }, { status: 404 })
    }

    // Marcar como inactivo en lugar de eliminar (soft delete)
    const { error } = await supabase.from('usuarios').update({ estaActivo: false }).eq('id', adminId)

    if (error) throw new Error(`Error al eliminar administrador: ${error.message}`)

    return NextResponse.json({
      success: true,
      message: 'Administrador eliminado exitosamente',
    })
  } catch (error) {
    console.error('Error deleting admin:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar administrador',
      },
      { status: 500 }
    )
  }
}
