<template>
  <div>
    <!-- Basic usage with title only -->
    <PageHeader title="Dashboard Overview" />

    <!-- With description -->
    <PageHeader 
      title="User Management" 
      description="View and manage all users in your system" 
    />

    <!-- With breadcrumbs -->
    <PageHeader 
      title="Settings" 
      breadcrumbs="['Dashboard', 'Settings', 'General']" 
    />

    <!-- With actions slot -->
    <PageHeader title="Posts">
      <template #actions>
        <button class="btn btn-primary">Create Post</button>
        <button class="btn btn-secondary">Export</button>
      </template>
    </PageHeader>

    <!-- Complete example -->
    <PageHeader 
      title="User Management" 
      description="View and manage all users in your system"
      :breadcrumbs="['Dashboard', 'Users']"
    >
      <template #actions>
        <button class="btn btn-primary">Add User</button>
        <button class="btn btn-secondary">Export Users</button>
        <button class="btn btn-danger">Delete Selected</button>
      </template>
    </PageHeader>
  </div>
</template>

<script setup lang="ts">
import PageHeader from "./PageHeader.vue";
</script> 