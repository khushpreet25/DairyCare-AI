import React, { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import "./NotificationBell.css";

function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const dropdownRef = useRef(null);

    // =====================================================
    // FETCH NOTIFICATIONS
    // =====================================================

    const fetchNotifications = async () => {

        try {

            setLoading(true);

            const response =
                await api.get("/notifications");

            setNotifications(
                response.data.notifications || []
            );

            setUnreadCount(
                response.data.unreadCount || 0
            );

        } catch (error) {

            console.error(
                "Failed to fetch notifications:",
                error
            );

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        fetchNotifications();

        // Refresh notifications every 60 seconds
        const interval = setInterval(() => {

            fetchNotifications();

        }, 60000);

        return () => clearInterval(interval);

    }, []);


    // =====================================================
    // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
    // =====================================================

    useEffect(() => {

        const handleClickOutside = (event) => {

            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {

                setOpen(false);

            }

        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

        };

    }, []);


    // =====================================================
    // TOGGLE DROPDOWN
    // =====================================================

    const toggleNotifications = () => {

        setOpen((previous) => !previous);

        // Refresh when opening
        if (!open) {

            fetchNotifications();

        }

    };


    // =====================================================
    // MARK SINGLE NOTIFICATION AS READ
    // =====================================================

    const markAsRead = async (notificationId) => {

        try {

            await api.patch(
                `/notifications/${notificationId}/read`
            );

            setNotifications((previous) =>
                previous.map((notification) =>
                    notification._id === notificationId
                        ? {
                            ...notification,
                            isRead: true
                        }
                        : notification
                )
            );

            setUnreadCount((previous) =>
                Math.max(previous - 1, 0)
            );

        } catch (error) {

            console.error(
                "Failed to mark notification as read:",
                error
            );

        }

    };


    // =====================================================
    // MARK ALL AS READ
    // =====================================================

    const markAllAsRead = async () => {

        try {

            await api.patch(
                "/notifications/read-all"
            );

            setNotifications((previous) =>
                previous.map((notification) => ({
                    ...notification,
                    isRead: true
                }))
            );

            setUnreadCount(0);

        } catch (error) {

            console.error(
                "Failed to mark all notifications as read:",
                error
            );

        }

    };


    // =====================================================
    // NOTIFICATION ICON
    // =====================================================

    const getNotificationIcon = (type) => {

        switch (type) {

            case "OVERDUE_REMINDER":
                return "⚠️";

            case "UPCOMING_REMINDER":
                return "⏰";

            case "SYSTEM":
                return "🔔";

            default:
                return "🔔";
        }

    };


    // =====================================================
    // PRIORITY CLASS
    // =====================================================

    const getPriorityClass = (priority) => {

        switch (priority) {

            case "HIGH":
                return "notification-high";

            case "MEDIUM":
                return "notification-medium";

            case "LOW":
                return "notification-low";

            default:
                return "";
        }

    };


    return (

        <div
            className="notification-wrapper"
            ref={dropdownRef}
        >

            {/* =================================================
                BELL BUTTON
            ================================================= */}

            <button
                type="button"
                className="notification-button"
                onClick={toggleNotifications}
                title="Notifications"
            >

                <span className="notification-bell">
                    🔔
                </span>

                {unreadCount > 0 && (

                    <span className="notification-badge">

                        {unreadCount > 99
                            ? "99+"
                            : unreadCount}

                    </span>

                )}

            </button>


            {/* =================================================
                DROPDOWN
            ================================================= */}

            {open && (

                <div className="notification-dropdown">

                    {/* HEADER */}

                    <div className="notification-header">

                        <div>

                            <h3>
                                Notifications
                            </h3>

                            <span>
                                {unreadCount} unread
                            </span>

                        </div>

                        {unreadCount > 0 && (

                            <button
                                type="button"
                                className="mark-all-button"
                                onClick={markAllAsRead}
                            >
                                Mark all as read
                            </button>

                        )}

                    </div>


                    {/* CONTENT */}

                    <div className="notification-list">

                        {loading && notifications.length === 0 ? (

                            <div className="notification-empty">

                                <div className="notification-loader">
                                    Loading...
                                </div>

                            </div>

                        ) : notifications.length === 0 ? (

                            <div className="notification-empty">

                                <div className="empty-bell">
                                    🔔
                                </div>

                                <h4>
                                    No notifications
                                </h4>

                                <p>
                                    You're all caught up.
                                </p>

                            </div>

                        ) : (

                            notifications.map(
                                (notification) => (

                                    <div
                                        key={notification._id}
                                        className={`notification-item ${
                                            !notification.isRead
                                                ? "unread"
                                                : ""
                                        } ${getPriorityClass(
                                            notification.priority
                                        )}`}
                                    >

                                        <div className="notification-icon">

                                            {getNotificationIcon(
                                                notification.type
                                            )}

                                        </div>


                                        <div className="notification-content">

                                            <div className="notification-title-row">

                                                <h4>
                                                    {notification.title}
                                                </h4>

                                                {!notification.isRead && (

                                                    <span className="unread-dot">
                                                    </span>

                                                )}

                                            </div>

                                            <p>
                                                {notification.message}
                                            </p>

                                            {notification.createdAt && (

                                                <span className="notification-time">

                                                    {new Date(
                                                        notification.createdAt
                                                    ).toLocaleString()}

                                                </span>

                                            )}

                                            {!notification.isRead && (

                                                <button
                                                    type="button"
                                                    className="read-button"
                                                    onClick={() =>
                                                        markAsRead(
                                                            notification._id
                                                        )
                                                    }
                                                >
                                                    Mark as read
                                                </button>

                                            )}

                                        </div>

                                    </div>

                                )
                            )

                        )}

                    </div>

                </div>

            )}

        </div>

    );

}

export default NotificationBell;