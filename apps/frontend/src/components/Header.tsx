import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Fragment } from 'react/jsx-runtime'
import { TokenStatusBadge } from './auth/TokenStatus'

export interface HeaderProps {
  breadcrumb?: {
    title: string
    url: string
  }[]
}

export default function Header({ breadcrumb }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        {breadcrumb && (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumb.map((item, i) => (
                <Fragment key={item.title}>
                  <BreadcrumbItem className="hidden md:block">
                    {i === breadcrumb.length - 1 ? (
                      <BreadcrumbPage>{item.title}</BreadcrumbPage>
                    ) : (
                      <>
                        <BreadcrumbLink href={item.url}>
                          {item.title}
                        </BreadcrumbLink>
                      </>
                    )}
                  </BreadcrumbItem>

                  {breadcrumb.indexOf(item) !== breadcrumb.length - 1 && (
                    <BreadcrumbSeparator className="hidden md:block" />
                  )}
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>
      <div className="ml-auto flex items-center gap-2 px-4">
        <TokenStatusBadge />
      </div>
    </header>
  )
}
