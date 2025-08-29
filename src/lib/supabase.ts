export const supabase = null as any

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'user' | 'admin'
          phone: string | null
          address: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
          phone?: string | null
          address?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
          phone?: string | null
          address?: any | null
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          title: string
          description: string
          price_usd: number
          price_inr: number
          original_price_usd: number | null
          original_price_inr: number | null
          category: string
          brand: string
          image_url: string
          images: string[]
          colors: string[]
          sizes: string[]
          features: string[]
          stock: number
          rating_average: number
          rating_count: number
          is_new: boolean
          is_trending: boolean
          is_featured: boolean
          is_active: boolean
          sku: string
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          price_usd: number
          price_inr: number
          original_price_usd?: number | null
          original_price_inr?: number | null
          category: string
          brand: string
          image_url: string
          images?: string[]
          colors?: string[]
          sizes?: string[]
          features?: string[]
          stock?: number
          rating_average?: number
          rating_count?: number
          is_new?: boolean
          is_trending?: boolean
          is_featured?: boolean
          is_active?: boolean
          sku: string
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string
          price_usd?: number
          price_inr?: number
          original_price_usd?: number | null
          original_price_inr?: number | null
          category?: string
          brand?: string
          image_url?: string
          images?: string[]
          colors?: string[]
          sizes?: string[]
          features?: string[]
          stock?: number
          rating_average?: number
          rating_count?: number
          is_new?: boolean
          is_trending?: boolean
          is_featured?: boolean
          is_active?: boolean
          sku?: string
          tags?: string[]
          updated_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          size: string | null
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity?: number
          size?: string | null
          color?: string | null
          created_at?: string
        }
        Update: {
          quantity?: number
          size?: string | null
          color?: string | null
        }
      }
      wishlist_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {}
      }
      orders: {
        Row: {
          id: string
          user_id: string
          total_amount_usd: number
          total_amount_inr: number
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_status: 'pending' | 'completed' | 'failed'
          shipping_address: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_amount_usd: number
          total_amount_inr: number
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_status?: 'pending' | 'completed' | 'failed'
          shipping_address: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_status?: 'pending' | 'completed' | 'failed'
          shipping_address?: any
          updated_at?: string
        }
      }
    }
  }
}
