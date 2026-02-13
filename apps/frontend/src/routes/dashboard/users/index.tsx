'use client'

import { useState, useEffect } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { userService } from '@/services/user'
import type { User } from '@/services/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/users/')({
  beforeLoad: () => {
    const userStr = localStorage.getItem('auth_user')
    if (!userStr) {
      throw redirect({ to: '/login' })
    }
    const user = JSON.parse(userStr)
    if (user.role !== 'admin') {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: RouteComponent,
})

const AVAILABLE_PERMISSIONS = [
  { value: 'admin:access', label: 'Admin Access' },
  { value: 'poli:access', label: 'Poli Access' },
  { value: 'category:access', label: 'Category Access' },
  { value: 'task-id:access', label: 'Task ID Access' },
]

function RouteComponent() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isPermissionOpen, setIsPermissionOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userPermissions, setUserPermissions] = useState<string[]>([])

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'user',
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await userService.getUsers()
      setUsers(response.data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Gagal mengambil data user')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await userService.createUser(formData)
      toast.success('User berhasil dibuat')
      setIsCreateOpen(false)
      setFormData({ username: '', password: '', name: '', role: 'user' })
      fetchUsers()
    } catch (error) {
      console.error('Failed to create user:', error)
      toast.error('Gagal membuat user')
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    try {
      await userService.updateUser(editingUser.id, {
        name: editingUser.name,
        role: editingUser.role,
        isActive: editingUser.isActive,
      })
      toast.success('User berhasil diupdate')
      setEditingUser(null)
      fetchUsers()
    } catch (error) {
      console.error('Failed to update user:', error)
      toast.error('Gagal mengupdate user')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return

    try {
      await userService.deleteUser(id)
      toast.success('User berhasil dihapus')
      fetchUsers()
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast.error('Gagal menghapus user')
    }
  }

  const openPermissionDialog = (user: User) => {
    setSelectedUser(user)
    setUserPermissions(user.permissions || [])
    setIsPermissionOpen(true)
  }

  const handleUpdatePermissions = async () => {
    if (!selectedUser) return

    try {
      await userService.updatePermissions(selectedUser.id, userPermissions)
      toast.success('Permissions berhasil diupdate')
      setIsPermissionOpen(false)
      fetchUsers()
    } catch (error) {
      console.error('Failed to update permissions:', error)
      toast.error('Gagal mengupdate permissions')
    }
  }

  const togglePermission = (permission: string) => {
    setUserPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kelola User</h1>
          <p className="text-muted-foreground">Manajemen user dan permissions</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>Tambah User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah User Baru</DialogTitle>
              <DialogDescription>
                Masukkan data user baru
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Username</label>
                <Input
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Nama</label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <DialogFooter>
                <Button type="submit">Simpan</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      user.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.permissions?.slice(0, 3).map((p) => (
                      <span
                        key={p}
                        className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {p}
                      </span>
                    ))}
                    {(user.permissions?.length || 0) > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{user.permissions.length - 3}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openPermissionDialog(user)}
                    >
                      Permissions
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingUser(user)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                    >
                      Hapus
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nama</label>
                <Input
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, role: e.target.value })
                  }
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingUser.isActive}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      isActive: e.target.checked,
                    })
                  }
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  Aktif
                </label>
              </div>
              <DialogFooter>
                <Button type="submit">Simpan</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isPermissionOpen} onOpenChange={setIsPermissionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Permissions</DialogTitle>
            <DialogDescription>
              Pilih permissions untuk user: {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {AVAILABLE_PERMISSIONS.map((permission) => (
              <label
                key={permission.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={userPermissions.includes(permission.value)}
                  onChange={() => togglePermission(permission.value)}
                />
                <span>{permission.label}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={handleUpdatePermissions}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
