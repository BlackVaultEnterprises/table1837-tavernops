use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ContentVersion {
    pub id: Uuid,
    pub content_id: Uuid,
    pub content_type: ContentType,
    pub version_number: i32,
    pub data: serde_json::Value,
    pub created_by: Uuid,
    pub created_at: DateTime<Utc>,
    pub change_summary: Option<String>,
    pub is_published: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ScheduledContent {
    pub id: Uuid,
    pub content_id: Uuid,
    pub content_type: ContentType,
    pub scheduled_data: serde_json::Value,
    pub publish_at: DateTime<Utc>,
    pub expire_at: Option<DateTime<Utc>>,
    pub created_by: Uuid,
    pub status: ScheduleStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct AuditLog {
    pub id: Uuid,
    pub user_id: Uuid,
    pub user_name: String,
    pub action: AuditAction,
    pub resource_type: String,
    pub resource_id: Uuid,
    pub changes: serde_json::Value,
    pub ip_address: String,
    pub user_agent: String,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "content_type")]
pub enum ContentType {
    MenuItem,
    Cocktail,
    Wine,
    Special,
    Event,
    StaffNote,
    Checklist,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "schedule_status")]
pub enum ScheduleStatus {
    Pending,
    Published,
    Expired,
    Cancelled,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "audit_action")]
pub enum AuditAction {
    Create,
    Update,
    Delete,
    Publish,
    Unpublish,
    Archive,
    Restore,
    PriceChange,
    StockUpdate,
    UserLogin,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CMSPermission {
    pub role: UserRole,
    pub resource: ResourceType,
    pub actions: Vec<Action>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "user_role")]
pub enum UserRole {
    Owner,
    Manager,
    Bartender,
    Server,
    Host,
    Kitchen,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ResourceType {
    Menu,
    Cocktails,
    Wine,
    Specials,
    Staff,
    Reports,
    Settings,
    Inventory,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Action {
    Read,
    Create,
    Update,
    Delete,
    Publish,
    ViewCost,
    ManageUsers,
    ViewAudit,
}

impl CMSPermission {
    pub fn default_permissions() -> Vec<CMSPermission> {
        vec![
            // Owner - Full access
            CMSPermission {
                role: UserRole::Owner,
                resource: ResourceType::Menu,
                actions: vec![Action::Read, Action::Create, Action::Update, Action::Delete, Action::Publish, Action::ViewCost, Action::ViewAudit],
            },
            // Manager - Most access except system settings
            CMSPermission {
                role: UserRole::Manager,
                resource: ResourceType::Menu,
                actions: vec![Action::Read, Action::Create, Action::Update, Action::Publish, Action::ViewCost],
            },
            // Bartender - Read recipes, update 86 list
            CMSPermission {
                role: UserRole::Bartender,
                resource: ResourceType::Cocktails,
                actions: vec![Action::Read],
            },
            // Server - Read only access
            CMSPermission {
                role: UserRole::Server,
                resource: ResourceType::Menu,
                actions: vec![Action::Read],
            },
        ]
    }
}