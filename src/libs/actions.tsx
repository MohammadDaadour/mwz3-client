"use server";

import { IRating } from "@/interfaces";
import axios from "axios";
import { cookies } from "next/headers";
import Image from "next/image";

const axiosServer = axios.create({ baseURL: process.env.API_URL, withCredentials: true });

export async function TrackingFunction(values: any) {
  const { data, status } = await axios
    .post(`${process.env.API_URL}/analytics/track`, values)
    .then((res) => res)
    .catch((err) => err.response);
  return { data, status };
}

export async function FetchAnalytics() {
  try {
    const [v, vp, uv, uvp, pv, d, tp] = await Promise.all([
      axios.get(`${process.env.API_URL}/analytics/visitors`),
      axios.get(`${process.env.API_URL}/analytics/views/period`),
      axios.get(`${process.env.API_URL}/analytics/unique-visitors`),
      axios.get(`${process.env.API_URL}/analytics/unique-visitors/period`),
      axios.get(`${process.env.API_URL}/analytics/page-views`),
      axios.get(`${process.env.API_URL}/analytics/devices`),
      axios.get(`${process.env.API_URL}/analytics/top-pages`),
    ]);

    return {
      visitors: v.data,
      viewsPeriod: vp.data,
      uniqueVisitors: parseInt(uv.data?.unique_visitors || "0", 10),
      uniqueVisitorsByPeriod: uvp.data,
      pageViews: pv.data,
      devices: d.data,
      topPages: tp.data,
      error: null,
    };
  } catch (err: any) {
    return {
      visitors: null,
      uniqueVisitors: 0,
      pageViews: null,
      devices: null,
      topPages: null,
      error: err.message || "Analytics fetch failed",
    };
  }
}

// if (token) {
//     config.headers.set("Cookie", `${token.name}=${token.value}`);
//   }

axiosServer.interceptors.request.use((config) => {
  // replaced with:
  // config.headers.set("Cookie", `${token.name}=${token.value}`);
  const token = cookies().get("Auth");
  const vipToken = cookies().get("access_token");

  const cookieParts = [];
  if (token) cookieParts.push(`${token.name}=${token.value}`);
  if (vipToken) cookieParts.push(`${vipToken.name}=${vipToken.value}`);

  if (cookieParts.length > 0) {
    config.headers.set("Cookie", cookieParts.join("; "));
  }

  return config;
});

export async function loginAction(values: any) {
  const { data, status } = await axios
    .post(`${process.env.API_URL}/login`, values, { withCredentials: true })
    .then((res) => res)
    .catch((err) => err.response);
  if ((await status) === 200) {
    if (values.remember) {
      cookies().set("Auth", data, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    } else {
      cookies().set("Auth", data, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
    }
  }
  return { data, status };
}

export async function logoutAction() {
  const { data, status } = await axiosServer.post(`/logout`, null);
  if (status === 200) {
    cookies().delete("Auth");
  }
  return { data, status };
}

export async function registerAction(values: any) {
  const { data, status } = await axios
    .post(`${process.env.API_URL}/register`, values)
    .then((res) => res)
    .catch((err) => err.response);
  return { data, status };
}

export async function sendActivationAction(email: string) {
  const { data, status } = await axios
    .post(`${process.env.API_URL}/email/request`, { email: email })
    .then((res) => res)
    .catch((err) => err.response);
  return { data, status };
}

export async function proccessActivationAction(token: string) {
  const { data, status } = await axios
    .post(`${process.env.API_URL}/email/activate`, { token: token })
    .then((res) => res)
    .catch((err) => err.response);
  return { data, status };
}

export async function sendResetAction(email: string) {
  const { data, status } = await axios
    .post(`${process.env.API_URL}/email/reset-request`, { email: email })
    .then((res) => res)
    .catch((err) => err.response);
  return { data, status };
}

export async function updatePasswordAction(value: string) {
  const { data, status } = await axiosServer
    .post(`/update-password`, { password: value })
    .then((res) => res)
    .catch((err) => err.response);
  return { data, status };
}

export async function resetPasswordAction(password: string, token: string) {
  const { data, status } = await axiosServer
    .post(`/reset-password`, { password: password, token: token })
    .then((res) => res)
    .catch((err) => err.response);
  return { data, status };
}

export async function VerifyResetToken(token: string) {
  const { data, status } = await axiosServer
    .post(`/email/verify-reset-token`, { token: token })
    .then((res) => res)
    .catch((err) => err.response);
  return { data, status };
}

export async function updateUserAction(user: number, values: any) {
  try {
    const res = await axiosServer.put(`/users/${user}`, values);
    return { status: res.status, data: res.data };
  } catch (err: any) {
    return {
      status: err.response?.status || 500,
      data: err.response?.data || { message: err.message }
    };
  }
}

export async function updateUserType(user: number, type: string) {
  const { status } = await axiosServer
    .put(`/users/${user}/type`, { type })
    .then((res) => res)
    .catch((err) => err.response);
}

export async function addFavAction(user: number, ad: number) {
  const { data, status } = await axiosServer
    .put(`/users/${user}/add`, { fav: ad })
    .then((res) => res)
    .catch((err) => err.response);
  console.log(status);
  console.log(data);
  return { data, status };
}

export async function removeFavAction(user: number, ad: number) {
  const { data, status } = await axiosServer
    .put(`/users/${user}/remove`, { fav: ad })
    .then((res) => res)
    .catch((err) => err.response);
  return { data, status };
}

export async function updateUserImageAction(user: number, data: FormData) {
  const { status } = await axiosServer
    .post(`/images/users/${user}`, data)
    .then((res) => res)
    .catch((err) => err.response);
  return status;
}

export async function deleteImageAction(image: number | undefined) {
  await axiosServer.delete(`/images/single/${image}`);
}

export async function uploadBannerAction(type: string, data: FormData) {
  const { status } = await axiosServer
    .post(`/images/banners/${type}`, data)
    .then((res) => res)
    .catch((err) => err.response);
  return status;
}

export async function createAdAction(values: any) {
  const { data, status } = await axiosServer
    .post(`/ads`, values)
    .then((res) => res)
    .catch((err) => err.response);
  return { data, status };
}

export async function updateAdAction(ad: number, data: any) {
  const { status } = await axiosServer.put(`/ads/${ad}`, data);
  return status;
}

export async function incAdVisitsAction(ad: number) {
  await axiosServer.put(`/ads/visits/${ad}`);
}

export async function updateAdAdminAction(ad: number, data: any) {
  const { status } = await axiosServer.put(`/ads/admin/${ad}`, data);
  return status;
}

export async function approveBoost(ad: number) {
  const { data, status } = await axiosServer.patch(`/ads/admin/${ad}/approve-boost`)
  return { data, status }
}

export async function rejectBoost(ad: number) {
  const { data, status } = await axiosServer.patch(`/ads/admin/${ad}/reject-boost`)
  return {
    data, status
  }
}

export async function deleteAdAction(ad: number) {
  const { status } = await axiosServer.delete(`/ads/${ad}`);
  return status;
}

export async function uploadAdImagesAction(id: number, data: FormData) {
  const { status } = await axiosServer.post(`/images/ads/${id}`, data);
  return status;
}

export async function addAdImagesAction(id: number, data: FormData) {
  const { status } = await axiosServer.post(`/images/ads/${id}?cover=y`, data);
  return status;
}

export async function createCategoryAction(values: any) {
  const { status } = await axiosServer
    .post("/categories", values)
    .then((res) => res)
    .catch((err) => err.response);
  return status;
}

export async function updateCategoryAction(id: number, values: any) {
  const { status } = await axiosServer
    .put(`/categories/${id}`, values)
    .then((res) => res)
    .catch((err) => err.response);
  return status;
}

export async function createAreaAction(values: any) {
  const { status } = await axiosServer
    .post("/areas", values)
    .then((res) => res)
    .catch((err) => err.response);
  return status;
}

export async function updateAreaAction(id: number, values: any) {
  const { status } = await axiosServer
    .put(`/areas/${id}`, values)
    .then((res) => res)
    .catch((err) => err.response);
  return status;
}

export async function updateRatingAction(dto: IRating) {
  const { status } = await axiosServer
    .put(`/ratings`, dto)
    .then((res) => res)
    .catch((err) => err.response);
  return status;
}

export async function sendMessageAction(sender: number, receiver: number, msg: string) {
  const { status } = await axiosServer
    .post(`/messages`, { tx: sender, rx: receiver, value: msg })
    .then((res) => res)
    .catch((err) => err.response);
}

export async function markReadAction(sender: number, receiver: number) {
  const { status } = await axiosServer
    .put(`/messages`, { tx: sender, rx: receiver })
    .then((res) => res)
    .catch((err) => err.response);
}

export async function updateSubType(id: number, values: any) {
  const { status } = await axiosServer
    .put(`/substypes/${id}`, values)
    .then((res) => res)
    .catch((err) => err.response);
  return status;
}

export async function deleteSubType(id: number) {
  await axiosServer
    .delete(`/substypes/${id}`)
    .then((res) => res)
    .catch((err) => err.response);
}

export async function restoreSubType(id: number) {
  await axiosServer
    .put(`/substypes/restore/${id}`)
    .then((res) => res)
    .catch((err) => err.response);
}

export async function createSubType(values: any) {
  const { status } = await axiosServer
    .post(`/substypes`, values)
    .then((res) => res)
    .catch((err) => err.response);
  return status;
}

export async function createSub(user: number, subType: number) {
  const { status } = await axiosServer
    .post(`/subs`, { userFK: user, subTypeFK: subType })
    .then((res) => res)
    .catch((err) => err.response);
  return status;
}

export async function updateSub(id: number, values: any) {
  const { status } = await axiosServer
    .put(`/subs/${id}`, values)
    .then((res) => res)
    .catch((err) => err.response);
  return status;
}

export async function deleteCommentAction(id: number) {
  const { status } = await axiosServer
    .delete(`/comments/${id}`)
    .then((res) => res)
    .catch((err) => err.response);
  return status;
}

export async function createCommentAction(values: any) {
  const { status } = await axiosServer
    .post(`/comments`, values)
    .then((res) => res)
    .catch((err) => err.response);
  return status;
}

export async function facebookAuth(code: string) {
  const { data, status } = await axios
    .get(`${process.env.API_URL}/facebook/redirect?code=${code}`)
    .then((res) => res)
    .catch((err) => err.response);

  if ((await status) === 200) {
    cookies().set("Auth", data, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return status;
  }
}

// export async function facebookLogin() {
//   const res = await axios.get('/facebook')
//   console.log(res)
// }

export async function googleAuth(code: string) {
  const { data, status } = await axios
    .get(`${process.env.API_URL}/google/redirect?code=${code}`)
    .then((res) => res)
    .catch((err) => err.response);

  if ((await status) === 200) {
    cookies().set("Auth", data, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return status;
  }
}

// export async function googleLogin() {
//   const res = await axios.get('/google')
//   console.log(res)
// }

export async function addToCartAction(userId: number, adId: number, quantity: number) {
  const { status } = await axiosServer
    .post(`/cart/add`, { userId, ad_id: adId, quantity })
    .then(res => res)
    .catch(err => err.response);
  return status;
}

export async function getAdByIdAction(adId: number) {
  const { data } = await axiosServer
    .get(`/ads/${adId}`)
    .then(res => res)
    .catch(err => err.response);
  return data;
}

export async function getAdImage(imageId: number) {
  const { data } = await axiosServer
    .get(`/images/ads/${imageId}/meta`)
    .then(res => res)

  return data;
}


export async function placeOrderAction(orderData: object) {
  const { status } = await axiosServer
    .post('/orders', orderData)
    .then(res => res)
    .catch(err => err.response)
  return status;
}

export async function getAllOrdersAction() {
  const { data } = await axiosServer
    .get('/orders/all')
    .then(res => res)
    .catch(err => err.response)
  return data;
}

export async function getUserOrdersAction() {
  try {
    const { data } = await axiosServer.get('/orders');
    return data;
  } catch (err: any) {
    console.error("Failed to fetch user orders:", err?.response?.data || err.message);
    return []; // fallback to an empty array instead of crashing
  }
}


export async function getOrderByIdAction(id: string) {
  const { data } = await axiosServer
    .get(`/orders/${id}`)
    .then(res => res)
    .catch(err => err.response);

  return data;
}


export async function updateOrderStatusAction(id: number, status: string) {
  const { status: resStatus } = await axiosServer
    .patch(`/orders/${id}/status`, { status })
    .then(res => res)
    .catch(err => err.response);

  return resStatus;
}

export async function getVendorOrdersAction() {
  const { data } = await axiosServer
    .get('/orders/vendor')
    .then(res => res)
    .catch(err => err.response);
}

export async function createPostAction(values: any) {
  try {
    const res = await axiosServer.post('/posts', values);
    return res.status;
  } catch (err: any) {
    return err?.response?.status || 500;
  }
}

export async function updatePostAction(postId: number, title: string, content: string) {
  try {
    const response = await axiosServer.patch(`/posts/${postId}/update`, {
      title,
      content
    });
    return {
      status: response.status,
      data: response.data
    };
  } catch (err: any) {
    return {
      status: err?.response?.status || 500,
      message: err?.response?.data?.message || 'Failed to update post'
    };
  }
}

export async function deletePostAction(postId: number) {
  const { status } = await axiosServer
    .delete(`/posts/${postId}`)
    .then(res => res)
    .catch(err => err.response);

  return status;
}

export async function deletePostAdminAction(postId: number) {
  const { status } = await axiosServer
    .delete(`/posts/guarded/${postId}`)
    .then(res => res)
    .catch(err => err.response);

  return status;
}

export async function getAllPosts(page = 1, limit = 10) {
  try {
    const { data } = await axiosServer.get('/posts', {
      params: { page, limit }
    });
    return data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

export async function getPostByIdAction(postId: number) {
  const { data } = await axiosServer
    .get(`/posts/${postId}`)
    .then(res => res)
    .catch(err => err.response);

  return data;
}

export async function getUserPosts(userId: number, page = 1, limit = 10) {
  try {
    const { data } = await axiosServer.get(`/posts/user/${userId}`, {
      params: { page, limit }
    });
    return data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

export async function createBlogCommentAction(postId: number, content: string, parentId?: number) {
  const body = parentId
    ? { content, parentId }
    : { content };

  const { status } = await axiosServer
    .post(`/blogcomments/post/${postId}`, body)
    .then(res => res)
    .catch(err => err.response);

  return status;
}

export async function updateBlogCommentAction(commentId: number, content: string) {
  const { status } = await axiosServer
    .patch(`/blogcomments/${commentId}`, { content })
    .then(res => res)
    .catch(err => err.response);

  return status;
}

export async function deleteBlogCommentAction(commentId: number) {
  const { status } = await axiosServer
    .delete(`/blogcomments/${commentId}`)
    .then(res => res)
    .catch(err => err.response);

  return status;
}

export async function deleteBlogCommentAdminAction(commentId: number) {
  const { status } = await axiosServer
    .delete(`/blogcomments/admin/${commentId}`)
    .then(res => res)
    .catch(err => err.response);

  return status;
}

export async function getIp() {
  const { data } = await axiosServer
    .get('/analytics/track-ip')
    .then(res => res)
    .catch(err => err.response);

  return data;
}

export async function sendBoostingRequest({ id, plan }: { id: number; plan: string }) {
  try {
    const { status, data } = await axiosServer.post(
      `${process.env.API_URL}/ads/${id}/boost-request`,
      { plan }
    );
    console.log("yup");
    return { status, data };
  } catch (err: any) {
    console.error("Boost request error:", {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
      stack: err.stack,
    });
    return {
      status: err.response?.status || 500,
      data: err.response?.data || null,
    };
  }
}

import { Buffer } from "buffer";

export async function uploadPostImagesAction(
  postId: string | number,
  files: { name: string; type: string; base64: string }[]
) {
  try {
    const formData = new FormData();
    for (const file of files) {
      const buffer = Buffer.from(file.base64.split(",")[1], "base64");
      const blob = new Blob([buffer], { type: file.type });
      formData.append("files", blob, file.name);
    }

    const { status, data } = await axiosServer.post(`/images/posts/${postId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return { status, data };
  } catch (err: any) {
    console.error("Error uploading images:", {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
      stack: err.stack,
    });
    return {
      error: err.message || "Failed to upload images",
      status: err.response?.status || 500,
      data: err.response?.data,
    };
  }
}

export async function getPostImagesAction(postId: string) {
  try {
    const apiUrl = process.env.API_URL!;
    const res = await fetch(`${apiUrl}/images/posts/${postId}`, {
      cache: "no-store",
    });

    if (!res.ok) return [];

    return (await res.json()) as { id: number; url: string; mime: string }[];
  } catch (error) {
    console.error("Error fetching post images:", error);
    return [];
  }
}

export async function deletePostImageAction(imageId: string) {
  try {
    const { status, data } = await axiosServer.delete(`${process.env.API_URL}/images/single/${imageId}`)

    return { status, data }
  }
  catch (err: any) {
    return err.response.data;
  }
}

export async function createVipUser(name: string, email: string, password: string, credit: number) {
  try {
    const { status, data } = await axiosServer.post('/vip-management', { name: name, email: email, password: password, credit: credit })

    return { status, data }
  }
  catch (err: any) {
    return { status: err.response?.status || 500, error: err.response?.data?.message || err.message };
  }
}

export async function getAllVipUsers() {
  const { data } = await axiosServer
    .get(`/vip-management`)
    .then(res => res)
    .catch(err => err.response);

  return data;
}

export async function loginVipUser(email: string, password: string) {
  try {
    const { status, data } = await axiosServer.post('/vip-management/login', { email: email, password: password })

    if (status === 200 || status === 201) {
      cookies().set("access_token", data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }

    return { status, data }
  }
  catch (err: any) {
    return { status: err.response?.status || 500, error: err.response?.data?.message || err.message };
  }
}

export async function getVipUserMe() {
  try {
    const { data } = await axiosServer.get(`/vip-management/profile/me`);
    return data;
  } catch (err: any) {
    console.error("Error fetching VIP user:", err.message);
    return null;
  }
}

export async function sendRequest(amount: number) {
  try {
    const { status, data } = await axiosServer.post('/vip-management/send-request', { amount: amount })

    return { status, data }
  }
  catch (err: any) {
    return {
      status: err.response?.status || 500,
      error: err.response?.data?.message || "Something went wrong"
    };
  }

}

export async function vipLogout() {
  const cookieStore = cookies();
  cookieStore.delete('access_token');
}

export async function approveRequest(userId: number, requestId: number) {
  try {
    const { status, data } = await axiosServer.patch(`/vip-management/approve-request/${userId}/${requestId}`);
    return { status, data };
  } catch (err: any) {
    return {
      status: err.response?.status || 500,
      error: err.response?.data?.message || "Something went wrong"
    };
  }
}

export async function rejectRequest(userId: number, requestId: number) {
  try {
    const { status, data } = await axiosServer.patch(`/vip-management/reject-request/${userId}/${requestId}`);
    return { status, data };
  } catch (err: any) {
    return {
      status: err.response?.status || 500,
      error: err.response?.data?.message || "Something went wrong"
    };
  }
}

export async function getVipUserDetails(id: number) {
  try {
    const { data } = await axiosServer.get(`/vip-management/profile/${id}`);
    return data;
  } catch (err: any) {
    console.error("Error fetching VIP user:", err.message);
    return null;
  }
}


export async function updateUserCredit(userId: number, credit: number) {
  try {
    const { status, data } = await axiosServer.patch(`/vip-management/${userId}`, { credit: credit });
    return { status, data };
  } catch (err: any) {
    return {
      status: err.response?.status || 500,
      error: err.response?.data?.message || "Something went wrong"
    };
  }
}

export async function getAreas() {
  try {
    const { data } = await axiosServer.get(`/areas`);
    return { data, status: 200 };
  } catch (err: any) {
    console.error("Failed to fetch areas:", err);
    return {
      data: [],
      status: err.response?.status || 500,
      error: "Could not fetch areas"
    };
  }
}

export async function createPayment(amount: number) {
  try {
    const { status, data } = await axiosServer.post('/payment/create', {
      amount: amount,
      user: {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "+201012345678"
      }
    });
    console.log(data);
    return { status, data };
  } catch (err: any) {
    return {
      status: err.response?.status || 500,
      error: err.response?.data?.message || "Something went wrong"
    };
  }
}