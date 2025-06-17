import "../styles/styles.css";
import App from "./pages/app";
import AuthModel from "./data/auth-model.js";
import Api from "./data/api.js";
import LoadingPopupPresenter from "./utils/loading-popup-presenter.js";

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });

  const logoutButton = document.querySelector("#logout-button");
  const logoutItem = document.querySelector("#logout-item");
  const skipLink = document.querySelector(".skip-to-content");
  const mainContent = document.querySelector("#main-content");
  const pushSubBtn = document.getElementById("push-subscription-btn");

  const toggleLogoutButton = () => {
    const token = AuthModel.getToken();
    logoutItem.style.display = token ? "block" : "none";
  };

  const handleSkipToContent = () => {
    if (!skipLink || !mainContent) return;

    skipLink.addEventListener("click", (e) => {
      e.preventDefault();
      mainContent.scrollIntoView({ behavior: "smooth", block: "start" });
      mainContent.focus();
      skipLink.blur();
      mainContent.classList.add("highlight-focus");
      setTimeout(() => {
        mainContent.classList.remove("highlight-focus");
      }, 2000);
    });
  };

  const renderWithTransition = async () => {
    if (document.startViewTransition && mainContent) {
      await document.startViewTransition(async () => {
        await app.renderPage();
        toggleLogoutButton();
      });
    } else {
      await app.renderPage();
      toggleLogoutButton();
    }
  };

  logoutButton?.addEventListener("click", () => {
    AuthModel.removeToken();
    toggleLogoutButton();
    window.location.hash = "/login";
  });

  handleSkipToContent();
  await renderWithTransition();

  window.addEventListener("hashchange", async () => {
    await renderWithTransition();
  });

  // Helper function untuk konversi VAPID key
  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Push Notification Setup
  if ("serviceWorker" in navigator && "PushManager" in window) {
    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register("/service-worker.js");
        console.log("Service Worker registered:", registration);

        await navigator.serviceWorker.ready;

        const updatePushButton = async () => {
          try {
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
              pushSubBtn.textContent = "Cancel Notification";
              pushSubBtn.disabled = false;
            } else {
              pushSubBtn.textContent = "Get Notified";
              pushSubBtn.disabled = false;
            }
          } catch (error) {
            console.error("Error updating button:", error);
            pushSubBtn.textContent = "Get Notified";
            pushSubBtn.disabled = false;
          }
        };

        await updatePushButton();

        // Event listener untuk tombol push notification
        pushSubBtn?.addEventListener("click", async () => {
          pushSubBtn.disabled = true;
          
          try {
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
              // Unsubscribe
              LoadingPopupPresenter.showLoading("Membatalkan notifikasi...");
              
              try {
                await subscription.unsubscribe();
                console.log("Unsubscribed from push notifications");

                const token = AuthModel.getToken();
                if (token) {
                  await Api.unsubscribeNotification(subscription, token);
                  console.log("Notifikasi dibatalkan di server");
                }

                pushSubBtn.textContent = "Get Notified";
                LoadingPopupPresenter.updateMessage("Notifikasi dibatalkan!");
              } catch (error) {
                console.error("Unsubscribe error:", error);
                LoadingPopupPresenter.updateMessage("Gagal membatalkan notifikasi!");
              } finally {
                setTimeout(() => LoadingPopupPresenter.hide(), 2000);
                pushSubBtn.disabled = false;
              }
            } else {
              // Subscribe
              LoadingPopupPresenter.showLoading("Mengaktifkan notifikasi...");

              try {
                // Request notification permission
                const permission = await Notification.requestPermission();
                console.log("Notification permission:", permission);
                
                if (permission !== "granted") {
                  alert("Izin notifikasi diperlukan untuk fitur ini.");
                  LoadingPopupPresenter.hide();
                  pushSubBtn.disabled = false;
                  return;
                }

                // Subscribe to push notifications
                const newSubscription = await registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: urlBase64ToUint8Array(
                    "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk"
                  ),
                });
                
                console.log("New push subscription:", newSubscription);

                const token = AuthModel.getToken();
                if (token) {
                  await Api.subscribeNotification(newSubscription, token);
                  console.log("Subscription berhasil dikirim ke server");
                }

                pushSubBtn.textContent = "Cancel Notification";
                LoadingPopupPresenter.updateMessage("Notifikasi berhasil diaktifkan! 🎉");

                // Test notification
                setTimeout(() => {
                  registration.showNotification("Story Apps", {
                    body: "Notifikasi berhasil diaktifkan!",
                    icon: "/images/applogo.png",
                    badge: "/images/applogo.png",
                  });
                }, 1000);

              } catch (error) {
                console.error("Subscribe error:", error);
                LoadingPopupPresenter.updateMessage("Gagal mengaktifkan notifikasi!");
              } finally {
                setTimeout(() => LoadingPopupPresenter.hide(), 2000);
                pushSubBtn.disabled = false;
              }
            }
          } catch (error) {
            console.error("Push notification error:", error);
            LoadingPopupPresenter.updateMessage("Terjadi kesalahan!");
            setTimeout(() => LoadingPopupPresenter.hide(), 2000);
            pushSubBtn.disabled = false;
          }
        });

        // Listen untuk pesan dari service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'SW_ACTIVATED') {
            console.log('Service Worker activated, updating push button');
            updatePushButton();
          }
        });

      } catch (err) {
        console.error("Service Worker registration failed:", err);
        pushSubBtn.textContent = "Not Supported";
        pushSubBtn.disabled = true;
      }
    });
  } else {
    // Browser tidak support
    console.log("Push messaging is not supported");
    if (pushSubBtn) {
      pushSubBtn.textContent = "Not Supported";
      pushSubBtn.disabled = true;
    }
  }
});