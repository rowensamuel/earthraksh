import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { adminService } from '../../services/adminService';
import { User, UserRole } from '../../types';
import { PlusIcon, EyeIcon, CheckIcon, CloseIcon } from '../../components/common/Icons';
import { showToast } from '../../components/common/Toast';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New user form state
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('EarthRakshak2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [newMobile, setNewMobile] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('FARMER');
  const [newDesignation, setNewDesignation] = useState('');

  // Edit user form state
  const [editFullName, setEditFullName] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('FARMER');
  const [editDesignation, setEditDesignation] = useState('');
  const [editStatus, setEditStatus] = useState<User['status']>('Active');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Failed to load users from database:', err);
      showToast('Database Error', 'error', err.message || 'Could not load users.');
    }
  };

  const filteredUsers = roleFilter === 'ALL'
    ? users
    : users.filter(u => u.role === roleFilter);

  const handleStatusChange = async (userId: string, newStatus: 'Active' | 'Inactive' | 'Suspended') => {
    try {
      await adminService.updateUserStatus(userId, newStatus);
      await loadUsers();
      showToast(`User status updated to ${newStatus} in database`, 'success');
    } catch (err: any) {
      console.error('Failed to update user status in database:', err);
      showToast('Database Error', 'error', err.message || 'Failed to update user status.');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newEmail) {
      showToast('Validation Error', 'error', 'Name and email are required.');
      return;
    }

    if (newPassword && newPassword.trim().length < 6) {
      showToast('Validation Error', 'error', 'Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.createUser({
        full_name: newFullName.trim(),
        email: newEmail.trim().toLowerCase(),
        mobile: newMobile.trim() || '+91 90000 00000',
        address: newAddress.trim() || 'Agricultural Sector, India',
        role: newRole,
        status: 'Active',
        designation: newDesignation.trim() || (newRole === 'FARMER' ? 'Agronomist & Producer' : newRole === 'ADMIN' ? 'Platform Administrator' : 'Procurement Officer'),
        verified: true
      }, newPassword.trim());

      await loadUsers();
      setIsAddModalOpen(false);
      setNewFullName('');
      setNewEmail('');
      setNewPassword('EarthRakshak2026!');
      setShowPassword(false);
      setNewMobile('');
      setNewAddress('');
      setNewDesignation('');
      setNewRole('FARMER');
      showToast('User Created in Database', 'success', `${newFullName} has been registered with role ${newRole}.`);
    } catch (err: any) {
      console.error('Failed to register user in database:', err);
      showToast('Database Error', 'error', err.message || 'Failed to persist user to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditFullName(user.full_name);
    setEditMobile(user.mobile);
    setEditAddress(user.address);
    setEditRole(user.role);
    setEditDesignation(user.designation || '');
    setEditStatus(user.status);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSubmitting(true);
    try {
      await adminService.updateUser(editingUser.user_id, {
        full_name: editFullName.trim(),
        mobile: editMobile.trim(),
        address: editAddress.trim(),
        role: editRole,
        designation: editDesignation.trim(),
        status: editStatus
      });
      await loadUsers();
      setEditingUser(null);
      showToast('User Updated', 'success', `Account profile for ${editFullName} updated.`);
    } catch (err: any) {
      console.error('Failed to update user:', err);
      showToast('Update Failed', 'error', err.message || 'Could not update user record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsSubmitting(true);
    try {
      await adminService.deleteUser(userToDelete.user_id, userToDelete.email);
      await loadUsers();
      setUserToDelete(null);
      showToast('User Deleted', 'info', `User account removed.`);
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      showToast('Delete Failed', 'error', err.message || 'Could not remove user record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<User>[] = [
    {
      header: 'User Identifier',
      accessorKey: 'user_id',
      sortable: true,
      cell: row => (
        <span className="font-semibold text-[#14291a]">{row.user_id}</span>
      )
    },
    {
      header: 'Full Name & Designation',
      accessorKey: 'full_name',
      sortable: true,
      cell: row => (
        <div>
          <span className="font-bold text-[#14291a] block">{row.full_name}</span>
          <span className="text-[11px] text-[#657a68]">{row.designation || 'Account holder'}</span>
        </div>
      )
    },
    {
      header: 'Role Workspace',
      accessorKey: 'role',
      sortable: true,
      cell: row => (
        <span className="font-semibold text-xs tracking-wider uppercase text-[#1b5e20]">
          {row.role}
        </span>
      )
    },
    {
      header: 'Contact Email & Mobile',
      accessorKey: 'email',
      cell: row => (
        <div>
          <span className="block text-[#1c2e22]">{row.email}</span>
          <span className="text-[11px] text-[#718574] tabular-nums">{row.mobile}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: row => <StatusBadge status={row.status} />
    },
    {
      header: 'Registered',
      accessorKey: 'created_at',
      sortable: true,
      cell: row => <span className="tabular-nums text-[#526655]">{row.created_at}</span>
    },
    {
      header: 'Actions',
      align: 'right',
      cell: row => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setSelectedUser(row)}
            className="p-1 text-[#455c48] hover:text-[#1b5e20] hover:bg-[#edf2ea] transition-colors"
            title="View Details"
          >
            <EyeIcon size={14} />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="px-2 py-0.5 text-[11px] text-[#2e5234] border border-[#a3c4a8] hover:bg-[#edf4ee] transition-colors"
            title="Edit User"
          >
            Edit
          </button>
          {row.status === 'Active' ? (
            <button
              onClick={() => handleStatusChange(row.user_id, 'Suspended')}
              className="px-2 py-0.5 text-[11px] text-[#991b1b] border border-[#fca5a5] hover:bg-[#fef2f2] transition-colors"
              title="Suspend User"
            >
              Suspend
            </button>
          ) : (
            <button
              onClick={() => handleStatusChange(row.user_id, 'Active')}
              className="px-2 py-0.5 text-[11px] text-[#1b5e20] border border-[#86efac] hover:bg-[#f0fdf4] transition-colors"
              title="Activate User"
            >
              Activate
            </button>
          )}
          <button
            onClick={() => setUserToDelete(row)}
            className="p-1 text-[#991b1b] hover:bg-[#fef2f2] transition-colors"
            title="Delete User"
          >
            <CloseIcon size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        category="Identity & Access Management"
        title="Platform User Registry & Security"
        description="Administer multi-tenant agricultural accounts, verify producer credentials, manage procurement authority, and audit role access permissions."
        actions={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold bg-[#1b5e20] text-white hover:bg-[#144719] flex items-center gap-1.5 transition-colors"
          >
            <PlusIcon size={15} />
            <span>Add User</span>
          </button>
        }
      />

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 p-1 bg-white border border-[#dbe3d8] w-fit">
        {(['ALL', 'ADMIN', 'FARMER', 'BUYER'] as const).map(role => (
          <button
            key={role}
            onClick={() => setRoleFilter(role)}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              roleFilter === role
                ? 'bg-[#1b5e20] text-white font-bold'
                : 'text-[#506352] hover:text-[#14291a]'
            }`}
          >
            {role === 'ALL' ? 'All Roles' : `${role}s`}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredUsers}
        searchPlaceholder="Search users by name, email, or user ID..."
        rowsPerPage={10}
      />

      {/* USER DETAILS MODAL */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="User Profile & Audit Record"
        subtitle={selectedUser ? `${selectedUser.user_id} · ${selectedUser.full_name}` : ''}
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#edf1ea]">
              <div>
                <span className="text-[11px] font-semibold text-[#667a68] uppercase block">Assigned Role</span>
                <span className="text-sm font-bold text-[#1b5e20]">{selectedUser.role}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-[#667a68] uppercase block">Current Status</span>
                <StatusBadge status={selectedUser.status} size="md" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-[#667a68] uppercase block">Email Address</span>
                <span className="text-xs text-[#1c2e22]">{selectedUser.email}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-[#667a68] uppercase block">Mobile Phone</span>
                <span className="text-xs tabular-nums text-[#1c2e22]">{selectedUser.mobile}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[11px] font-semibold text-[#667a68] uppercase block">Registered Address</span>
                <span className="text-xs text-[#1c2e22]">{selectedUser.address}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[11px] font-semibold text-[#667a68] uppercase block">Designation / Enterprise Title</span>
                <span className="text-xs text-[#1c2e22]">{selectedUser.designation || 'None'}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {selectedUser.status === 'Active' ? (
                <button
                  onClick={() => {
                    handleStatusChange(selectedUser.user_id, 'Suspended');
                    setSelectedUser(null);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-[#991b1b] border border-[#f87171] hover:bg-[#fef2f2]"
                >
                  Suspend Account
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleStatusChange(selectedUser.user_id, 'Active');
                    setSelectedUser(null);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-[#1b5e20] border border-[#86efac] hover:bg-[#f0fdf4]"
                >
                  Activate Account
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ADD USER MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Platform Account"
        subtitle="Provision user credentials and assign enterprise access privileges"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#304734] mb-1">
              Role Specification
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['ADMIN', 'FARMER', 'BUYER'] as UserRole[]).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setNewRole(r)}
                  className={`py-1.5 px-2 text-xs font-medium border text-center ${
                    newRole === r
                      ? 'border-[#1b5e20] bg-[#1b5e20] text-white font-bold'
                      : 'border-[#c9d4c6] bg-white text-[#455c48]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#304734] mb-1">
              Full Legal Name *
            </label>
            <input
              type="text"
              value={newFullName}
              onChange={e => setNewFullName(e.target.value)}
              placeholder="e.g. Anand Mahindra"
              className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Official Email *
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="name@organization.com"
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Mobile Number
              </label>
              <input
                type="text"
                value={newMobile}
                onChange={e => setNewMobile(e.target.value)}
                placeholder="+91 98220 12345"
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#304734]">
                Account Password *
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] font-medium text-[#2e5234] hover:underline"
              >
                {showPassword ? 'Hide Password' : 'Show Password'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="e.g. EarthRakshak2026! or custom password"
              className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              minLength={6}
              required
            />
            <p className="text-[10px] text-[#718574] mt-1">
              Minimum 6 characters. Default is EarthRakshak2026!.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#304734] mb-1">
              Designation / Organization Role
            </label>
            <input
              type="text"
              value={newDesignation}
              onChange={e => setNewDesignation(e.target.value)}
              placeholder="e.g. Lead Grain Cultivator / Logistics Coordinator"
              className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#304734] mb-1">
              Physical Operational Address
            </label>
            <input
              type="text"
              value={newAddress}
              onChange={e => setNewAddress(e.target.value)}
              placeholder="Agri Hub, Tehsil, State, PIN"
              className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#edf1ea]">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3.5 py-1.5 text-xs font-semibold border border-[#c9d4c6] bg-white text-[#455c48] hover:bg-[#edf2ea]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-semibold bg-[#1b5e20] text-white hover:bg-[#144719] disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : 'Confirm Registration'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT USER MODAL */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Modify User Profile & Credentials"
        subtitle={editingUser ? `${editingUser.user_id} · ${editingUser.email}` : ''}
      >
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#304734] mb-1">
              Role Authority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['ADMIN', 'FARMER', 'BUYER'] as UserRole[]).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setEditRole(r)}
                  className={`py-1.5 px-2 text-xs font-medium border text-center ${
                    editRole === r
                      ? 'border-[#1b5e20] bg-[#1b5e20] text-white font-bold'
                      : 'border-[#c9d4c6] bg-white text-[#455c48]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#304734] mb-1">
              Full Legal Name *
            </label>
            <input
              type="text"
              value={editFullName}
              onChange={e => setEditFullName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Mobile Number
              </label>
              <input
                type="text"
                value={editMobile}
                onChange={e => setEditMobile(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#304734] mb-1">
                Account Status
              </label>
              <select
                value={editStatus}
                onChange={e => setEditStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#304734] mb-1">
              Designation / Enterprise Title
            </label>
            <input
              type="text"
              value={editDesignation}
              onChange={e => setEditDesignation(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#304734] mb-1">
              Registered Address
            </label>
            <input
              type="text"
              value={editAddress}
              onChange={e => setEditAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] focus:outline-none focus:border-[#1b5e20]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#edf1ea]">
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              className="px-3.5 py-1.5 text-xs font-semibold border border-[#c9d4c6] bg-white text-[#455c48] hover:bg-[#edf2ea]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-semibold bg-[#1b5e20] text-white hover:bg-[#144719] disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Updates'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        title="Confirm User Account Deletion"
        subtitle={userToDelete ? `${userToDelete.full_name} (${userToDelete.email})` : ''}
      >
        <div className="space-y-4">
          <p className="text-xs text-[#526655] leading-relaxed">
            Are you sure you want to delete this user profile? All associated farmer / buyer database mappings and records will be unlinked or removed in accordance with relational foreign key policies.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#edf1ea]">
            <button
              type="button"
              onClick={() => setUserToDelete(null)}
              className="px-3.5 py-1.5 text-xs font-semibold border border-[#c9d4c6] bg-white text-[#455c48] hover:bg-[#edf2ea]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleDeleteUser}
              className="px-4 py-1.5 text-xs font-semibold bg-[#991b1b] text-white hover:bg-[#7f1d1d] disabled:opacity-50"
            >
              {isSubmitting ? 'Deleting...' : 'Delete User'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
