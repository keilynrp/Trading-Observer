"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Permission = "view_dashboard" | "manage_users" | "manage_roles" | "edit_settings" | "view_market_data";

interface Role {
    id: string;
    name: string;
    permissions: Permission[];
}

interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    status: string;
    avatar?: string;
}

interface PermissionContextType {
    currentUser: User | null;
    currentRole: Role | null;
    allUsers: User[];
    allRoles: Role[];
    hasPermission: (permission: Permission) => boolean;
    switchUser: (userId: string) => void;
    isLoading: boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentRole, setCurrentRole] = useState<Role | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initPermissions = async () => {
            try {
                const [usersRes, rolesRes] = await Promise.all([
                    fetch("/api/settings/users"),
                    fetch("/api/settings/roles")
                ]);

                const users = await usersRes.json();
                const roles = await rolesRes.json();

                setAllUsers(users);
                setAllRoles(roles);

                // Load last active user or default to admin
                const savedUserId = localStorage.getItem("active_user_id");
                const user = users.find((u: User) => u.id === savedUserId) || users.find((u: User) => u.role === "admin") || users[0];

                if (user) {
                    setCurrentUser(user);
                    const role = roles.find((r: Role) => r.id === user.role);
                    setCurrentRole(role || null);
                }
            } catch (error) {
                console.error("Failed to initialize permissions:", error);
            } finally {
                setIsLoading(false);
            }
        };

        initPermissions();
    }, []);

    const hasPermission = (permission: Permission) => {
        if (!currentRole) return false;
        return currentRole.permissions.includes(permission);
    };

    const switchUser = (userId: string) => {
        const user = allUsers.find(u => u.id === userId);
        if (user) {
            setCurrentUser(user);
            const role = allRoles.find(r => r.id === user.role);
            setCurrentRole(role || null);
            localStorage.setItem("active_user_id", userId);
        }
    };

    return (
        <PermissionContext.Provider value={{
            currentUser,
            currentRole,
            allUsers,
            allRoles,
            hasPermission,
            switchUser,
            isLoading
        }}>
            {children}
        </PermissionContext.Provider>
    );
}

export function usePermissions() {
    const context = useContext(PermissionContext);
    if (context === undefined) {
        throw new Error("usePermissions must be used within a PermissionProvider");
    }
    return context;
}
